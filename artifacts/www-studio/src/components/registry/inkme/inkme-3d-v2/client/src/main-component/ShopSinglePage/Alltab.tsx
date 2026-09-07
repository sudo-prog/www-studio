import * as React from 'react';

import Sb1 from '../../img/review/01.jpg'
import Sb2 from '../../img/review/02.jpg'
import Sb3 from '../../img/review/01.jpg'
import ContactForm from './ContactForm';


const Alltab = (props) => {

    const [activeTab, setActiveTab] = useState('Tab2');
    const openTab = (TabName) => {
        setActiveTab(TabName);
    }
    useEffect(() => {
        openTab('Tab2');
    }, []);

    return (
        <div className="single-tab">
            <ul className="nav mb-4">
                {/* <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'Tab1' ? 'active' : ''}`} onClick={() => openTab('Tab1')}>
                        Description
                    </button>
                </li> */}
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'Tab2' ? 'active' : ''}`} onClick={() => openTab('Tab2')}>Product information</button>
                </li>
                {/* <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'Tab3' ? 'active' : ''}`} onClick={() => openTab('Tab3')}>
                        reviews (4)
                    </button>
                </li> */}
            </ul>
            <div className="tab-content">
                <div id="description" style={{ display: activeTab === 'Tab1' ? 'block' : 'none' }}>
                    <div className="description-items">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="description-content">
                                    <h3 className="wow fadeInUp" data-wow-delay=".3s">Experience Is Over The World Visit</h3>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate vestibulum Phasellus rhoncus, dolor eget viverra pretium, dolor Numquam odit accusantium odit aut commodi et. Nostrum est atque ut dolorum. Et sequi aut atque doloribus qui. Iure amet in voluptate reiciendis. Perspiciatis consequatur aperiam repellendus velit quia est minima. tellus aliquet nunc vitae ultricies erat elit eu lacus. Vestibulum non justo consectetur, cursus ante, tincidunt sapien. Nulla quis diam sit amet turpis interdum accumsan quis necenim. Vivamus faucibus ex sed nibh egestas elementum. Mauris et bibendum dui. Aenean consequat pulvinar luctus
                                    </p>
                                    <h3 className="mb-0 mt-5 split-text right">More Details</h3>
                                    <div className="description-list-items d-flex">
                                        <ul className="description-list">
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry</span>
                                            </li>
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span>Lorem Ipsum has been the ‘s standard dummy text. Lorem Ipsumum is simply dummy text.</span>
                                            </li>
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span>type here your detail one by one li more add</span>
                                            </li>
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span>has been the industry’s standard dummy text ever since. Lorem Ips</span>
                                            </li>
                                        </ul>
                                        <ul className="description-list">
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span>Lorem Ipsum generators on the tend to repeat.</span>
                                            </li>
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span> If you are going to use a passage.</span>
                                            </li>
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span> Lorem Ipsum generators on the tend to repeat.</span>
                                            </li>
                                            <li>
                                                <i className="fal fa-check"></i>
                                                <span> Lorem Ipsum generators on the tend to repeat.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="additional" style={{ display: activeTab === 'Tab2' ? 'block' : 'none' }}>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Size</th>
                                    <th>Shirt length</th>
                                    <th>Ngang áo</th>
                                    <th>Dài tay</th>
                                    <th>Height</th>
                                    <th>Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>S</td>
                                    <td>67 cm</td>
                                    <td>51 cm</td>
                                    <td>20 cm</td>
                                    <td>1m50 - 1m60</td>
                                    <td>50-60kg</td>
                                </tr>
                                <tr>
                                    <td>M</td>
                                    <td>70 cm</td>
                                    <td>53 cm</td>
                                    <td>21 cm</td>
                                    <td>1m60 - 1m70</td>
                                    <td>60kg - 70kg</td>
                                </tr>
                                <tr>
                                    <td>L</td>
                                    <td>72 cm</td>
                                    <td>55 cm</td>
                                    <td>22 cm</td>
                                    <td>1m70 - 1m75</td>
                                    <td>70kg - 80kg</td>
                                </tr>
                                <tr>
                                    <td>XL</td>
                                    <td>74 cm</td>
                                    <td>57 cm</td>
                                    <td>23 cm</td>
                                    <td>1m75 - 1m80</td>
                                    <td>80kg - 90kg</td>
                                </tr>


                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="review" style={{ display: activeTab === 'Tab3' ? 'block' : 'none' }}>
                    <div className="review-items">
                        <div className="admin-items d-flex flex-wrap flex-md-nowrap align-items-center pb-4">
                            <div className="admin-img pb-4 pb-md-0 me-4">
                                <img src={Sb1} alt="image" />
                            </div>
                            <div className="content p-4">
                                <div className="head-content pb-1 d-flex flex-wrap justify-content-between">
                                    <h5>miklos salsa<span>27June 2024 at 5.44pm</span></h5>
                                    <div className="star">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.
                                </p>
                            </div>
                        </div>
                        <div className="admin-items d-flex flex-wrap flex-md-nowrap align-items-center pb-4">
                            <div className="admin-img pb-4 pb-md-0 me-4">
                                <img src={Sb2} alt="image" />
                            </div>
                            <div className="content p-4">
                                <div className="head-content pb-1 d-flex flex-wrap justify-content-between">
                                    <h5>Ethan Turner <span>27June 2024 at 5.44pm</span></h5>
                                    <div className="star">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.
                                </p>
                            </div>
                        </div>
                        <div className="admin-items d-flex flex-wrap flex-md-nowrap align-items-center pb-4">
                            <div className="admin-img pb-4 pb-md-0 me-4">
                                <img src={Sb3} alt="image" />
                            </div>
                            <div className="content p-4">
                                <div className="head-content pb-1 d-flex flex-wrap justify-content-between">
                                    <h5>miklos salsa<span>27June 2024 at 5.44pm</span></h5>
                                    <div className="star">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.
                                </p>
                            </div>
                        </div>
                        <div className="admin-items d-flex flex-wrap flex-md-nowrap align-items-center pb-4">
                            <div className="admin-img pb-4 pb-md-0 me-4">
                                <img src={Sb2} alt="image" />
                            </div>
                            <div className="content p-4">
                                <div className="head-content pb-1 d-flex flex-wrap justify-content-between">
                                    <h5>Ethan Turner <span>27June 2024 at 5.44pm</span></h5>
                                    <div className="star">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                                <p>
                                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.Curabitur vulputate vestibulum Phasellus rhoncus dolor eget viverra pretium.
                                </p>
                            </div>
                        </div>
                        <div className="review-title mt-5 py-15 mb-30">
                            <h4>add a review</h4>
                            <div className="rate-now d-flex align-items-center">
                                <p>Rate this product? *</p>
                                <div className="star">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                            </div>
                        </div>
                        <div className="review-form">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default Alltab;
export { Alltab as InkMeAlltab };
