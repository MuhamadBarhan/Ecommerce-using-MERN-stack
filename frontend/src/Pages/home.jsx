import React, { useEffect, useState } from 'react';
import axios from "axios"
import ClipLoader from 'react-spinners/ClipLoader';
import ImageCarousel from './Components/ImageCarousel';
import './Styles/home.css';
import ProductCard from './Components/ProductCard'
import image1 from '../data/Images/image1.webp'
import image2 from '../data/Images/image2.jpg'
import image3 from '../data/Images/image3.jpg'
import image4 from '../data/Images/image4.jpg'
import banner from '../data/Images/banner.png'
import { addProduct } from '../redux/reducer/products';
import { useDispatch } from 'react-redux';
import { baseUrl } from '../url'
import { setCartItems } from '../redux/reducer/cart';
import toast, { Toaster } from 'react-hot-toast';
import Sponsored from './Components/Sponsored';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';


const Home = () => {
  const categories = [
    'Fashion',
    'Electronics',
    'Home & Kitchen',
    'Beauty',
    'Sports & Toys',
    'Footwear & Bags',
    'Accessories',
    'Groceries'
  ];


  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/allproducts`);
        dispatch(addProduct(response.data));
        setAllProducts(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Network Error");
      }
    };

    if (localStorage.getItem('auth-token')) {
      axios.post(`${baseUrl}/getcart`, {}, {
        headers: {
          Accept: '*/*',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        }
      })
        .then(res => {
          dispatch(setCartItems(res.data));
          console.log(res.data)
        })
        .catch(err => {
          console.log(err);
        });
    }


    fetchProducts();
  }, [dispatch]);

  //Carousel Images
  const images = [image1, image2, image3, image4,];

  return (
    <div>
      <Toaster />
      {loading ? (
        <div className="loading-animation">
          <ClipLoader color="#008ecc" loading={loading} size={20} />
          <p style={{textAlign:'center'}}>Since backend was hosted on render,it takes some time for initial loading</p> 
        </div>
      ) : (
        <div className="container">
          <div className="category-container">
            <div className="category c"><FontAwesomeIcon icon={faTableCellsLarge}/></div>
            {categories.map((category, index) => (
              <div key={index} className="category">
                {category} <FontAwesomeIcon icon={faChevronDown}/>
              </div>
            ))}
          </div>
          <div className="image-carousel">
            <ImageCarousel images={images} />
          </div>
          <ProductCard product={allProducts}/>
          <img src={banner} alt="banner" className='banner' />
          <Sponsored product={allProducts} />
          <ProductCard product={allProducts} />
        </div>
      )}
    </div>
  );
};

export default Home;
