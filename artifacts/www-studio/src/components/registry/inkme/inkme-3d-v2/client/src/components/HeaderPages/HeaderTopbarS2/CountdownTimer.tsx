import * as React from 'react';

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24;

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();

        const nextYear = yyyy + 1;
        const dayMonth = "08/20/";
        let birthday = dayMonth + yyyy;

        const currentDate = mm + "/" + dd + "/" + yyyy;
        if (currentDate > birthday) {
            birthday = dayMonth + nextYear;
        }

        const countDown = new Date(birthday).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = countDown - now;

            const days = Math.floor(distance / day);
            const hours = Math.floor((distance % day) / hour);
            const minutes = Math.floor((distance % hour) / minute);
            const seconds = Math.floor((distance % minute) / second);

            setTimeLeft({
                days,
                hours,
                minutes,
                seconds,
            });

            // If the countdown is finished, show a message
            if (distance < 0) {
                clearInterval(interval);
                document.getElementById("headline").innerText = "It's my birthday!";
                document.getElementById("countdown").style.display = "none";
                document.getElementById("content").style.display = "block";
            }
        };

        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <ul id="countdown">
                <li>
                    <span id="day">{timeLeft.days} :</span>
                </li>
                <li>
                    <span id="Hours">{timeLeft.hours} :</span>
                </li>
                <li>
                    <span id="Minutes">{timeLeft.minutes} :</span>
                </li>
                <li>
                    <span id="Seconds">{timeLeft.seconds}</span>
                </li>
            </ul>
            <h1 id="headline"></h1>
            <div id="content" style={{ display: "none" }}>
                {/* Content after countdown */}
            </div>
        </div>
    );
};

// export default CountdownTimer;
export { CountdownTimer as InkMeCountdownTimer };
