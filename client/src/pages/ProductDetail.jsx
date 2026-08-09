import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getProduct } from '../services/productService.js';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import Notice from '../components/ui/Notice.jsx';
import Button from '../components/ui/Button.jsx';
import ProductGallery from '../components/products/ProductGallery.jsx';
import ProductBuyBox from '../components/products/ProductBuyBox.jsx';
import ProductFacts from '../components/products/ProductFacts.jsx';
import RelatedProducts from '../components/products/RelatedProducts.jsx';
import ToastStack from '../components/products/ToastStack.jsx';

/** Breadcrumb row. Its own component so the loading and loaded states share it. */
function Crumbs({ category, name }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-7 flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-muted"
    >
      <Link to="/" className="no-underline hover:underline">
        Home
      </Link>
      <span className="opacity-45">›</span>
      <Link to="/products" className="no-underline hover:underline">
        Shop
      </Link>
      {category && (
        <>
          <span className="opacity-45">›</span>
          <span>{category}</span>
        </>
      )}
      {name && (
        <>
          <span className="opacity-45">›</span>
          <span className="text-navy-900" aria-current="page">
            {name}
          </span>
        </>
      )}
    </nav>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="bc-skeleton aspect-square w-full rounded-img" />
      <div className="space-y-4 pt-2">
        <div className="bc-skeleton h-3 w-1/4 rounded" />
        <div className="bc-skeleton h-10 w-3/4 rounded" />
        <div className="bc-skeleton h-8 w-1/3 rounded" />
        <div className="bc-skeleton h-4 w-full rounded" />
        <div className="bc-skeleton h-4 w-5/6 rounded" />
        <div className="bc-skeleton h-12 w-1/2 rounded-btn" />
      </div>
    </div>
  );
}

/**
 * /products/:id — one product.
 *
 * Restructured for v2 into the wireframe's three bands: gallery beside
 * the buy box, a collapsible facts band, then a related-products row.
 * v1 had all of it crammed into a single 2-column block with a
 * category-tinted gradient panel behind the image.
 *
 * The gallery takes an array even though the model stores one image —
 * see ProductGallery for why the thumbnail strip is conditional rather
 * than four copies of the same photo.
 */
export default function ProductDetail() {
  const { id } = useParams();
  const { add, deliveryFee } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);

  // Clicking a related product changes :id without unmounting this page, so
  // the previous product has to be cleared before the new one renders.
  // Adjusting state during render is React's documented pattern for this;
  // doing it in the effect would paint the old product for a frame first.
  const [shownId, setShownId] = useState(id);
  if (shownId !== id) {
    setShownId(id);
    setProduct(null);
    setError('');
    setLoading(true);
  }

  const notify = (message, type = 'success') => {
    const tid = Date.now() + Math.random();
    setToasts((t) => [...t, { id: tid, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 3400);
  };
  const dismiss = (tid) => setToasts((t) => t.filter((x) => x.id !== tid));

  useEffect(() => {
    let active = true;
    window.scrollTo({ top: 0 });

    (async () => {
      try {
        const data = await getProduct(id);
        if (active) setProduct(data);
      } catch (err) {
        if (active) setError(err.message || 'Could not load this product.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const handleAdd = (item, qty = 1) => {
    add(item, qty);
    notify(`${item.name} ×${qty} added to cart`);
  };

  return (
    <main>
      <Band tone="white" className="!pt-11 lg:!pb-20">
        <Container>
          <Crumbs category={product?.category} name={product?.name} />

          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="mx-auto max-w-[560px] py-10 text-center">
              <Notice tone="warn" className="text-left">
                {error}
              </Notice>
              <Button to="/products" variant="outline" className="mt-6">
                Back to the shop
              </Button>
            </div>
          ) : product ? (
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <ProductGallery images={[product.image]} name={product.name} />
              <ProductBuyBox
                product={product}
                onAdd={handleAdd}
                deliveryFee={deliveryFee}
              />
            </div>
          ) : null}
        </Container>
      </Band>

      {product && !loading && (
        <>
          <ProductFacts fee={deliveryFee} />
          <RelatedProducts
            key={product._id}
            category={product.category}
            excludeIds={[product._id]}
            onAdd={(p) => handleAdd(p, 1)}
            title="Often bought together"
          />
        </>
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
