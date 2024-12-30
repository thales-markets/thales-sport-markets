const ChristmasHeaderAnimation: React.FC = () => {
    return (
        <div className="snowflakes" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="snowflake">
                    <div className="inner">❅</div>
                </div>
            ))}
        </div>
    );
};

export default ChristmasHeaderAnimation;
