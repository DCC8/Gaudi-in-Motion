export default function VideoBackground() {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden -z-50 bg-black">
            <video
                className="w-full h-full object-cover opacity-50"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/assets/hero_video_poster.jpg" // Optional placeholder if needed
            >
                <source src="/assets/hero_video.mp4" type="video/mp4" />
            </video>
            <div className="noise-overlay absolute inset-0 mix-blend-overlay" />
            {/* Gradient overlay to ensure text readability if needed, though opacity 50% on black bg helps */}
            <div className="absolute inset-0 bg-black/20" />
        </div>
    );
}
