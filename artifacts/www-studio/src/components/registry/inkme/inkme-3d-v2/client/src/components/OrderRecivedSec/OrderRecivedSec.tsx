import React from 'react';
import {Link} from 'react-router-dom'
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {totalPrice} from "../../utils";
import './style.scss'

const OrderRecivedSec = ({cartList}) => {
    return(
        <section className="cart-recived-section section-padding">
            <div className="container">
                <div className="row">
                    <div className="order-top">
                        <h2>Thank You For Your Order! <span>your order has been recived</span></h2>
                        <Link to='/home' className="theme-btn">Back Home</Link>
                    </div>
                    <Grid className="cartStatus">
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Grid className="cartTotals">
                                        <h4>Order details</h4>
                                        <Table>
                                            <TableBody>
                                                {cartList.map(item => (
                                                    <TableRow key={item.id}>
                                                        <TableCell><img src={item.proImg} alt="" /> {item.title} ${item.price} x {item.qty}</TableCell>
                                                        <TableCell
                                                            align="right">${item.qty * item.price}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="totalProduct">
                                                    <TableCell>Total product</TableCell>
                                                    <TableCell align="right">{cartList.length}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Sub Price</TableCell>
                                                    <TableCell align="right">${totalPrice(cartList)}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><b>Total Price</b></TableCell>
                                                    <TableCell
                                                        align="right"><b>${totalPrice(cartList)}</b></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                </div>
            </div>
        </section>
    )
}

// export default OrderRecivedSec;
export { OrderRecivedSec as InkMeOrderRecivedSec };
