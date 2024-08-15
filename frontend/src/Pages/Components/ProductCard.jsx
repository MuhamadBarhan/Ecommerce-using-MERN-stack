import React, { useState } from 'react';
import { faHeart as before } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as after } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemWishList, removeItemWishList } from '../../redux/reducer/wishlist';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Accessing the wishlist from Redux store
  const wishlist = useSelector((state) => state.wish.list);

  // Using state to track wish icon for each product
  const [wishIcons, setWishIcons] = useState({});

  const handleChange = (productId) => {
    const isWished = wishIcons[productId] === after;

    if (isWished) {
      // If already in wishlist, remove it
      dispatch(removeItemWishList(productId));
    } else {
      // If not in wishlist, add it
      const selectedProduct = product.find((item) => item.id === productId);
      dispatch(addItemWishList(selectedProduct));
    }

    // Toggle the wish icon
    setWishIcons((prevIcons) => ({
      ...prevIcons,
      [productId]: isWished ? before : after,
    }));
  };

  return (
    <div className="productCardContainer">
      <p style={{ fontSize: '18px', fontWeight: '600', color: '#3a3a3a', margin: '0.7rem 0rem' }}>Featured Products</p>
      <div className="card-cont">
        {product.map((item) => (
          <div className="productCard" key={item.id}>
            <div className="selectProduct">
              <FontAwesomeIcon
                icon={wishIcons[item.id] || (wishlist.some(wishItem => wishItem.id === item.id) ? after : before)}
                className={`wishIcon ${wishIcons[item.id] === after ? 'active-wish-icon' : ''}`}
                onClick={() => handleChange(item.id)}
              />
            </div>
            <div className="navigation" onClick={() => navigate(`/productdetails/${item.id}`)}>
              <div className="imageContainer">
                <img src={item.image} alt={item.name} className="productImage" />
              </div>
              <p style={{ paddingLeft: '0.5rem', color: '#373737' }} className='productName'>{item.name}</p>
              <span style={{ paddingLeft: '0.5rem', fontWeight: '700', fontSize: '14px' }}>Rs.{item.new_price}</span>
              <span style={{ paddingLeft: '0.5rem', fontWeight: '500', fontSize: '14px', color: 'gray' }}><strike>Rs.{item.old_price}</strike></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
