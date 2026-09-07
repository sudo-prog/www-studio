import * as React from 'react';
import { useParams } from 'react-router-dom';
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import PageTitle from '../../components/pagetitle/PageTitle'
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';

import Product from './product'
import ProductTabs from './alltab';
import { getProductById } from '../../services/ShopServices';

const ProductSinglePage = () => {

    const { slug } = useParams()
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getProductById(slug);

                if (response && response.success !== false) {
                    // Ensure proper data structure for images and other arrays
                    const productData = {
                        ...response,
                        images: response.images || [],
                        color: response.color || [],
                        productSize: response.productSize || []
                    };
                    setProduct(productData);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    if (loading) {
        return (
            <Fragment>
                <NavbarS2 hclass={'header-section-2 style-two'} />
                <PageTitle pageTitle={'Digital printing Service'} pagesub={'Product Single'} />
                <section className="product-details-section section-padding section-bg-2">
                    <div className="container">
                        <div className="product-details-wrapper">
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading products.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <CtaSectionS2 />
                <FooterS3 />
            </Fragment>
        );
    }

    if (error) {
        return (
            <Fragment>
                <NavbarS2 hclass={'header-section-2 style-two'} />
                <PageTitle pageTitle={'Digital printing Service'} pagesub={'Product Single'} />
                <section className="product-details-section section-padding section-bg-2">
                    <div className="container">
                        <div className="product-details-wrapper">
                            <div className="text-center">
                                <h4 className="text-danger">Error</h4>
                                <p>{error}</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.location.reload()}
                                >Try again</button>
                            </div>
                        </div>
                    </div>
                </section>
                <CtaSectionS2 />
                <FooterS3 />
            </Fragment>
        );
    }

    return (
        <Fragment>
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'InkMe3D'} pagesub={'Product information'} />
            <section className="product-details-section section-padding section-bg-2">
                <div className="container">
                    <div className="product-details-wrapper">
                        {product && (
                            <Product
                                product={product}
                            />
                        )}
                        <ProductTabs />
                    </div>
                </div>
            </section>
            <CtaSectionS2 />
            <FooterS3 />
        </Fragment>
    )
};

// export default ProductSinglePage;



export { ProductSinglePage as InkMeProductSinglePage };
