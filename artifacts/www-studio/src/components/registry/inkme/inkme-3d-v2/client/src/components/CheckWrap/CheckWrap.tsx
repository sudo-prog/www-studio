import * as React from 'react';
import Grid from "@mui/material/Grid";
import SimpleReactValidator from "simple-react-validator";
import {toast} from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";

import './style.scss';

const CheckWrap = (props) => {

    const push = useNavigate()

    const [value, setValue] = useState({
        email: 'user@gmail.com',
        password: '123456',
        card_holder: 'Jhon Doe',
        card_number: '589622144',
        cvv: '856226',
        expire_date: '',
        remember: false,
    });

    const changeHandler = (e) => {
        setValue({...value, [e.target.name]: e.target.value});
        validator.showMessages();
    };


    const [validator] = React.useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));

    const submitForm = (e) => {
        e.preventDefault();
        if (validator.allValid()) {
            setValue({
                email: '',
                password: '',
                card_holder: '',
                card_number: '',
                cvv: '',
                expire_date: '',
                remember: false
            });
            validator.hideMessages();

            const userRegex = /^user+.*/gm;
            const email = value.email;

            if (email.match(userRegex)) {
                toast.success('Order Recived sucessfully!');
                push('/order_received');
            }  else {
                toast.info('user not existed!');
                alert('user not existed! credential is : user@*****.com | vendor@*****.com | admin@*****.com');
            }
        } else {
            validator.showMessages();
            toast.error('Empty field is not allowed!');
        }
    };
    return (
        <Grid className="cardbp mt-20">
            <Grid>
                <form onSubmit={submitForm}>
                    <Grid container spacing={3}>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                fullWidth
                                label="Card holder Name"
                                name="card_holder"
                                value={value.card_holder}
                                onChange={(e) => changeHandler(e)}
                                type="text"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                className="formInput radiusNone"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                fullWidth
                                label="Card Number"
                                name="card_number"
                                value={value.card_number}
                                onChange={(e) => changeHandler(e)}
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                className="formInput radiusNone"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={value.cvv}
                                onChange={(e) => changeHandler(e)}
                                type="text"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                className="formInput radiusNone"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                fullWidth
                                label="Expire Date"
                                name="expire_date"
                                value={value.expire_date}
                                onChange={(e) => changeHandler(e)}
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                className="formInput radiusNone"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formFooter mt-20">
                                <Button fullWidth className="cBtn cBtnLarge cBtnTheme mt-20" type="submit">Proceed to Checkout</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        </Grid>
    )
};

// export default CheckWrap;
export { CheckWrap as InkMeCheckWrap };
