import React from "react";
import ClockLoader from "react-spinners/ClockLoader";

export default function Hero(props)
{
    return (
        <section className="hero is-small">
            <div className="hero-body">
                <div className="container">
                    <h1 className="title">
                        <ClockLoader css={{display: 'inline-block', marginRight: '.25em'}} size={24} loading={true} />
                        {props.title}
                    </h1>
                    <h2 className="subtitle">
                        {props.subTitle}
                    </h2>
                </div>
            </div>
        </section>
    );
}