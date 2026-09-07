import * as React from 'react';
import SimpleReactValidator from 'simple-react-validator';
import { Link } from 'react-router-dom'
import Aimg from '../../../img/news/author.png'
import Bimg1 from '../../../img/news/pp1.jpg'
import Bimg2 from '../../../img/news/pp2.jpg'
import Bimg3 from '../../../img/news/pp3.jpg'



const ClickHandler = () => {
    window.scrollTo(10, 0);
}

const BlogSidebar = (props) => {


    const [search, setSearch] = useState('');
    const [validator] = useState(new SimpleReactValidator());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validator.allValid()) {
        } else {
            validator.showMessages();
        }
    };










    return (
        <div className="main-sidebar">
            <div className="single-sidebar-widget">
                <div className="news-profile-items">
                    <div className="author-img">
                        <img src={Aimg} alt=" img" />
                    </div>
                    <div className="content">
                        <h6>Rosalina D. Willaim</h6>
                        <span>Blogger/Photographer</span>
                        <p>
                            he whimsically named Egg Canvas is the
                            design director and photographer
                            in New York. Why the nam
                        </p>
                        <div className="social-icon d-flex align-items-center">
                            <Link onClick={ClickHandler} to="#"><i className="fab fa-facebook-f"></i></Link>
                            <Link onClick={ClickHandler} to="#"><i className="fab fa-twitter"></i></Link>
                            <Link onClick={ClickHandler} to="#"><i className="fa-brands fa-linkedin-in"></i></Link>
                            <Link onClick={ClickHandler} to="#"><i className="fa-brands fa-youtube"></i></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h5>search here</h5>
                </div>
                <div className="search_widget">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Search here..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={() => validator.showMessageFor('search')}
                        />
                        {validator.message('search', search, 'required|alpha_num')}

                        <button type="submit">
                            <i className="fal fa-search"></i>
                        </button>
                    </form>
                </div>
            </div>
            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h5>Recent Post</h5>
                </div>
                <div className="recent-post-area">
                    <div className="recent-items">
                        <div className="recent-thumb">
                            <img src={Bimg1} alt="img" />
                        </div>
                        <div className="recent-content">
                            <ul>
                                <li>
                                    <i className="fa-solid fa-calendar-days"></i>
                                    10/01/2024
                                </li>
                            </ul>
                            <h6>
                                <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">
                                    Budget Issues Force The Our To Become
                                </Link>
                            </h6>
                        </div>
                    </div>
                    <div className="recent-items">
                        <div className="recent-thumb">
                            <img src={Bimg2} alt="img" />
                        </div>
                        <div className="recent-content">
                            <ul>
                                <li>
                                    <i className="fa-solid fa-calendar-days"></i>
                                    14/03/2024
                                </li>
                            </ul>
                            <h6>
                                <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">
                                    The Best Products That Shape Fashion
                                </Link>
                            </h6>
                        </div>
                    </div>
                    <div className="recent-items">
                        <div className="recent-thumb">
                            <img src={Bimg3} alt="img" />
                        </div>
                        <div className="recent-content">
                            <ul>
                                <li>
                                    <i className="fa-solid fa-calendar-days"></i>
                                    22/03/2024
                                </li>
                            </ul>
                            <h6>
                                <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">
                                    The Best Products That Shape Fashion
                                </Link>
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h5>Catagories</h5>
                </div>
                <div className="news-widget-categories">
                    <ul>
                        <li><Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Mobile Set </Link> <span>03</span></li>
                        <li className="active"><Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Mobile Set </Link> <span>03</span></li>
                        <li><Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Mobile Set </Link> <span>03</span></li>
                        <li><Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Mobile Set </Link> <span>03</span></li>
                    </ul>
                </div>
            </div>
            <div className="single-sidebar-widget">
                <div className="wid-title">
                    <h5>Populer Tags</h5>
                </div>
                <div className="tagcloud">
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">symphony</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">nokia</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">nokia</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Samsung</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Alcatel</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Oppos</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">landing</Link>
                    <Link onClick={ClickHandler} to="/news-details/How-To-Teach-Kids-Ramadan-Isn’t-About-Food">Oppos</Link>
                </div>
            </div>
        </div>
    )

}

// export default BlogSidebar;
export { BlogSidebar as InkMeBlogSidebar };
