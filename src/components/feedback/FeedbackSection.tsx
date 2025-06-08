import React, { useEffect, useRef } from 'react';
import { Fade } from 'react-awesome-reveal';
import FeedbackCard from './FeedbackCard';

// Duplicate the feedbacks to create a seamless loop
const feedbacks = [
  {
    id: 1,
    name: 'Madhuvani',
    rating: 5,
    comment:
      'Amazing experience! The car was in perfect condition and the service was excellent.',
    date: 'March 15, 2024',
  },
  {
    id: 2,
    name: 'Manasa',
    rating: 4,
    comment:
      'Very convenient and hassle-free rental process. Would definitely recommend!',
    date: 'March 12, 2024',
  },
  {
    id: 3,
    name: 'Kiranmai',
    rating: 5,
    comment:
      'Great selection of vehicles and competitive prices. The staff was very helpful.',
    date: 'March 10, 2024',
  },
  {
    id: 4,
    name: 'Srinithya',
    rating: 4,
    comment:
      'Smooth booking process and excellent customer support. Will use again!',
    date: 'March 8, 2024',
  },
];

// Double the feedbacks array for seamless loop
const allFeedbacks = [...feedbacks, ...feedbacks];

const FeedbackSection: React.FC = () => {
  const [isPaused, setIsPaused] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 bg-secondary-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <Fade direction="up" triggerOnce>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Read about experiences from our satisfied customers who have used
              our car rental services.
            </p>
          </div>
        </Fade>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <style>
            {`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }

              .marquee {
                display: flex;
                width: fit-content;
                animation: scroll 30s linear infinite;
              }

              .marquee:hover {
                animation-play-state: paused;
              }
            `}
          </style>

          <div
            ref={containerRef}
            className="marquee"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {allFeedbacks.map((feedback, index) => (
              <div
                key={`${feedback.id}-${index}`}
                className="w-[400px] flex-shrink-0 px-3"
              >
                <FeedbackCard {...feedback} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
