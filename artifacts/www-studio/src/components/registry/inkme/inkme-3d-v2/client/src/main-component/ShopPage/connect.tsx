import * as React from 'react';
import { connect } from "react-redux";
import PageTitle from '../../components/pagetitle/PageTitle'
import { addToCart } from "../../store/actions/action";
import ShopProduct from '../../components/ShopProduct';
import api from "../../api";
import NavbarS2 from '../../components/NavbarPages/NavbarS2/NavbarS2';
import CtaSectionS2 from '../../components/CtaPages/CtaSectionS2/CtaSectionS2';
import FooterS3 from '../../components/FooterPages/footerS3/FooterS3';
import SocialMetaTags from '../../components/SocialMetaTags/SocialMetaTags';

import { getProducts } from '../../services/ShopServices';

const ShopPage = ({ addToCart }) => {

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');



    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProducts();
                setProducts(response);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };
        fetchProduct();
    }, []);



    const addToCartProduct = (product, qty = 1) => {
        addToCart(product, qty);
    };

    return (
        <Fragment>
            <SocialMetaTags 
                title="InkMe Shop - Professional printed products"
                description="Explore InkMe's collection of printed products: T-shirts, hoodies, handbags, and many more. Online 3D design, high quality, affordable prices."
                image="/inkme_thumbnail.png"
                url="/shop"
            />
            <NavbarS2 hclass={'header-section-2 style-two'} />
            <PageTitle pageTitle={'InkMe - 3D Printing Services'} pagesub={'Store'} />
            <ShopProduct
                addToCartProduct={addToCartProduct}
                products={products}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}

            />
            <CtaSectionS2 />
            <FooterS3 />

        </Fragment>
    )
};

// export default connect(null, { addToCart })(ShopPage);
export { ShopPage as InkMeShopPage };
