import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface FontSizeContextType {
    fontSize: FontSize;
    increaseFont: () => void;
    decreaseFont: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSize] = useState<FontSize>(() => {
        const saved = localStorage.getItem('temi_font_size');
        return (saved as FontSize) || 'base';
    });

    useEffect(() => {
        localStorage.setItem('temi_font_size', fontSize);
    }, [fontSize]);

    const increaseFont = () => {
        setFontSize(prev => {
            if (prev === 'sm') return 'base';
            if (prev === 'base') return 'lg';
            if (prev === 'lg') return 'xl';
            return prev;
        });
    };

    const decreaseFont = () => {
        setFontSize(prev => {
            if (prev === 'xl') return 'lg';
            if (prev === 'lg') return 'base';
            if (prev === 'base') return 'sm';
            return prev;
        });
    };

    return (
        <FontSizeContext.Provider value={{ fontSize, increaseFont, decreaseFont }}>
            {children}
        </FontSizeContext.Provider>
    );
}

export function useFontSize() {
    const context = useContext(FontSizeContext);
    if (!context) {
        throw new Error('useFontSize must be used within a FontSizeProvider');
    }
    return context;
}
