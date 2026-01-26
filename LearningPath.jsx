import React from 'react';
import { motion } from 'framer-motion';

const LearningPath = () => {
    // Animation variants for the cards
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.2,
                duration: 0.6,
                ease: "easeOut"
            }
        })
    };

    // Animation variants for the connecting line
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut",
                delay: 0.4 // Start drawing after cards begin to appear
            }
        }
    };

    return (
        <div style={styles.container}>
            {/* SVG Layer for Connectivity */}
            <div style={styles.svgContainer}>
                <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none">
                    <defs>
                        {/* Glowing Green Filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                    </defs>

                    {/* 
            Path Logic:
            Connects bottom of Card 1 (approx 16% x, 30% y) 
            to top of Card 2 (approx 50% x, 40% y)
            and then to Card 3.
          */}
                    <motion.path
                        d="M 166 200 C 166 300, 500 200, 500 300 V 300 M 500 420 C 500 500, 833 400, 833 480"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="8 8" // Dash-array pattern
                        filter="url(#glow)"
                        variants={pathVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    />
                </svg>
            </div>

            {/* Cards Layout Grid */}
            <div style={styles.grid}>

                {/* Card 1: Top-Left */}
                <div style={{ ...styles.col, justifyContent: 'flex-start' }}>
                    <GlassCard
                        index={0}
                        variants={cardVariants}
                        title="Course"
                        highlight="Python"
                        items={["Syntax", "Memory Management", "OOP"]}
                    />
                </div>

                {/* Card 2: Center */}
                <div style={{ ...styles.col, justifyContent: 'center' }}>
                    <GlassCard
                        index={1}
                        variants={cardVariants}
                        title="Topics"
                        highlight="Pandas, NumPy"
                        items={["DataFrames", "Vectorization", "Broadcasting"]}
                    />
                </div>

                {/* Card 3: Bottom-Right */}
                <div style={{ ...styles.col, justifyContent: 'flex-end' }}>
                    <GlassCard
                        index={2}
                        variants={cardVariants}
                        title="Subtopics"
                        highlight="Loops, If/Else"
                        items={["Control Flow", "List Comprehensions", "Generators"]}
                    />
                </div>
            </div>
        </div>
    );
};

const GlassCard = ({ title, highlight, items, index, variants }) => (
    <motion.div
        custom={index}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={styles.card}
    >
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4ade80' }}>{title}</h3>
        <div style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{highlight}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                    {item}
                </li>
            ))}
        </ul>
    </motion.div>
);

const styles = {
    container: { position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px', minHeight: '600px', backgroundColor: '#0f172a' },
    svgContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', position: 'relative', zIndex: 1, height: '100%', minHeight: '500px' },
    col: { display: 'flex', flexDirection: 'column', height: '100%' },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    }
};

export default LearningPath;