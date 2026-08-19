import Counter from '../models/Counter.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Atomically reserve the next integer in a named sequence.
 *
 * The fast path is a single `$inc` — the database serialises it, so concurrent
 * callers always get distinct numbers. The slow path runs at most once per
 * database: the counter does not exist yet, so it is created at whatever
 * `computeStart()` reports as the highest number already in use. That matters
 * when switching an existing database (in-memory dev data, or an Atlas cluster
 * seeded under the old count-based scheme) over to this allocator — starting
 * from zero would reissue numbers that already exist and fail on the unique
 * index forever.
 *
 * @param {string} name          Sequence name, e.g. 'order'.
 * @param {() => Promise<number>} computeStart  Highest number already issued.
 * @returns {Promise<number>} The reserved number.
 */
export async function nextSequence(name, computeStart) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const bumped = await Counter.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { new: true }
    );
    if (bumped) return bumped.seq;

    // Counter missing — seed it, then loop round and take a number from it.
    try {
      const start = await computeStart();
      await Counter.updateOne(
        { _id: name },
        { $setOnInsert: { seq: Number.isFinite(start) ? start : 0 } },
        { upsert: true }
      );
    } catch (err) {
      // Another process seeded it between our read and our upsert. Fine — the
      // next iteration will just $inc the counter they created.
      if (err?.code !== 11000) throw err;
    }
  }

  throw new Error(`Could not allocate a number from the "${name}" sequence`);
}

/**
 * The highest number already used in `field` across `Model`, for values shaped
 * `<prefix><digits>` (e.g. 'BC-1042' → 1042). Returns 0 when there are none.
 *
 * Done as a `$max` over the parsed integer rather than a lexicographic sort,
 * because sorting strings puts 'BC-9999' above 'BC-10000'.
 */
export async function highestNumber(Model, field, prefix) {
  const rows = await Model.aggregate([
    { $match: { [field]: { $regex: `^${escapeRegex(prefix)}\\d+$` } } },
    { $project: { n: { $toInt: { $substrCP: [`$${field}`, prefix.length, 24] } } } },
    { $group: { _id: null, max: { $max: '$n' } } },
  ]);
  return rows.length && Number.isFinite(rows[0].max) ? rows[0].max : 0;
}
