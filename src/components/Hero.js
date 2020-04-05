import React from "react";

export default function Hero(props)
{
    return (
        <section className="hero is-small">
            <div className="hero-body">
                <div className="container">
                    <h1 className="title">
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