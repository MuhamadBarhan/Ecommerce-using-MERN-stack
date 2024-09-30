import React from 'react'
import { useSelector } from 'react-redux'
import WishlistComp from './Components/WishlistComp'

const Wishlist = () => {
    const list=useSelector((state)=>state.wish.list);
  return (
    <>
    {list.map((item)=>(
      <WishlistComp {...item} key={item.id}/>
    ))}
    </>
  )
}

export default Wishlist