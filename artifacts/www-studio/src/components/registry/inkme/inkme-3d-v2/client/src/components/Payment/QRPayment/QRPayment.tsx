import * as React from 'react'
import { MyContext } from '../../../context/MyContext';
import { startPaymentMonitoring } from '../../../services/PaymentService';
import { editData } from '../../../utils/api';
import { trackPurchase } from '../../../utils/analytics';

const QRPayment = ({ order }) => {
    const context = useContext(MyContext);
    const [paymentStatus, setPaymentStatus] = useState('waiting'); // waiting, paid, error
    const [paymentMessage, setPaymentMessage] = useState('');
    const [stopMonitoring, setStopMonitoring] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    //Get orderId from order prop, fallback to context.orderData.orderId if not available
    const orderId = order?.orderId || order?._id || context.orderData?.orderId || '';

    const orderData = {
        // orderCode: Number(String(Date.now()).slice(-6)),
        amount: context.cartData.reduce((total, item) => total + item.price * item.quantity, 0),
        // description: "Thanh toan don hang",
        items: context.cartData.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
        bank: "bidv",
        accountNumber: "V3CASS66688889999",
        template: "print.png",
        addInfo: orderId,
        // + " - " + context.selectedAddressId,
        accountName: "NGUYEN TIEN DAT",
        returnUrl: `${window.location.origin}/checkout?success=true`,
        cancelUrl: `${window.location.origin}/checkout?canceled=true`,
    };

    const qrCode = `https://img.vietqr.io/image/${orderData.bank}-${orderData.accountNumber}-${orderData.template}?amount=${orderData.amount}&addInfo=${orderData.addInfo}&accountName=${orderData.accountName}`

    //Handle when successful payment is detected
    const handlePaymentDetected = async (transaction) => {
        setPaymentStatus('paid');
        setPaymentMessage('Payment successful! Your order has been confirmed.');

        // Google Analytics tracking - Purchase Complete
        if (order) {
            trackPurchase({
                orderId: order.orderId || order._id,
                amount: order.amount || orderData.amount,
                products: order.products || context.cartData?.map(item => ({
                    productId: item.productId || item.id,
                    productTitle: item.productTitle || item.name,
                    price: item.price,
                    quantity: item.quantity,
                    inkmeFile: item.inkmeFile || null,
                    classifications: item.classifications || []
                })) || []
            });
        }

        //Update order status in database
        try {
            if (order?._id) {
                await editData(`/api/orders/${order._id}/pay`, {
                    paymentTransaction: transaction
                });
            }

            //Display success notification
            context.setAlterBox({
                open: true,
                error: false,
                message: "Payment successful! Order has been confirmed.",
            });
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    //Start monitoring payment when component mounts
    useEffect(() => {
        if (orderId && orderData.amount > 0) {
            const stopFn = startPaymentMonitoring(orderId, orderData.amount, handlePaymentDetected);
            setStopMonitoring(() => stopFn);
        }

        // Cleanup khi component unmount
        return () => {
            if (stopMonitoring) {
                stopMonitoring();
            }
        };
    }, [orderId, orderData.amount]);

    //Display content based on payment status
    if (paymentStatus === 'paid') {
        return (
            <div className='payment-success'
                style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: '#f0f8f0',
                    borderRadius: '8px',
                    border: '2px solid #4caf50'
                }}
            >
                <div style={{ fontSize: '24px', color: '#4caf50', marginBottom: '10px' }}>
                    ✅ Thanh toán thành công!
                </div>
                <div style={{ fontSize: '16px', color: '#666' }}>
                    {paymentMessage}
                </div>
                <div style={{ marginTop: '15px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.href = `/user/orders/${user?.userId}`}
                    >View order</button>
                </div>
            </div>
        );
    }

    return (
        <div className='qr-payment'
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >

            <img src={qrCode} alt="QR Code" />
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', color: '#999' }}>⏳ Checking payment.</div>
            </div>
        </div>
    )
}

// export default QRPayment
export { QRPayment as InkMeQRPayment };
