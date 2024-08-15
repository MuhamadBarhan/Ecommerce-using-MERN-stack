import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux'
import CartComp from './Components/CartComp'
import { modifyItem, removeItem } from '../redux/reducer/cart';
import './Styles/CartComp.css'
import { useNavigate } from 'react-router-dom';
import { setCartItems } from '../redux/reducer/cart';
import {baseUrl} from '../url'
import ClipLoader from 'react-spinners/ClipLoader';

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const list = useSelector((state) => state.cart.list);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const incrementItem = (item) => {
    dispatch(modifyItem({ ...item, count: item.count + 1 }))
  }

  const decrementItem = (item) => {
    if (item.count === 1) {
      dispatch(removeItem(item))
    }
    else {
      dispatch(modifyItem({ ...item, count: item.count - 1 }))
    }
  };

  const removeItemFromCart = (item) => {
    dispatch(removeItem(item));
  }

  const calculatePrices = () => {
    let totalPrice = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    list.forEach(item => {
      const itemTotalPrice = item.old_price * item.count;
      const itemTotalDiscount = (item.old_price - item.new_price) * item.count;
      totalPrice += itemTotalPrice;
      totalDiscount += itemTotalDiscount;
      totalItems += item.count;
    });

    const totalAmount = totalPrice-totalDiscount;

    return { totalPrice, totalDiscount, totalAmount, totalItems };
  }

  useEffect(() => {
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
          setLoading(false);
          console.log(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }
    else {
      setLoading(false);
    }
  }, [dispatch]);

  const { totalPrice, totalDiscount, totalAmount, totalItems } = calculatePrices();

  return (
    <>
      {loading ? (
        <div className="loading-animation">
          <ClipLoader color="#008ecc" loading={loading} size={20} />
        </div>
      ) : (
        <>
          {list.length > 0  ? (
            <>
              <div className="cart-cont">
                <div className="cart-left-cont">
                  <div className="ct-heading"><span className="ct-heading-text">Your Cart Items</span></div>
                  {list.map((item) => (
                    <CartComp {...item} key={item.id} incrementItem={() => incrementItem(item)} decrementItem={() => decrementItem(item)} removeItem={() => removeItemFromCart(item)} />
                  ))}
                  <div className='place-order-cont pc'>
                    <button className='formBtn ' onClick={() => navigate('/checkout')}>Place Order</button>
                  </div>
                </div>
                <div className="ct-right-cont">
                  <div className="ct-right-cont-heading">
                    <span className="ct-right-cont-heading-text">Price Details</span>
                  </div>
                  <div className="price-info">
                    <div className="price-item">
                      <span className="item-label">Price ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                      <span className="item-value">₹{totalPrice}</span>
                    </div>
                    <div className="price-item">
                      <span className="item-label">Discount</span>
                      <span className="item-value">− ₹{totalDiscount}</span>
                    </div>
                    <div className="price-item">
                      <span className="item-label">Delivery Charges</span>
                      <span className="item-value">Free</span>
                    </div>
                  </div>
                  <div className="price-total">
                    <div className="price-item">
                      <span className="item-label">Total Amount</span>
                      <span className="item-value">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
                <div className='place-order-cont'>
                    <button className='formBtn' onClick={() => navigate('/checkout')}>Place Order</button>
                </div>
              </div>
            </>
          ) : (
          <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'80vh'}}>
           <p>No Items in the Cart</p>
           <button onClick={()=>navigate('/')} className='formBtn'>Add Items</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Cart
