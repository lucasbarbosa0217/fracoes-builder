import React, { useMemo } from 'react';

export default function FractionBlock({
    num,
    den,
    shape = 'rect',
    numeratorFill = 'rgba(107, 184, 255, 0.9)',
    unfilledFill = 'rgba(220,220,220,0.55)',
    opTop = null,
    opBot = null,
    hideLabel = false,
    thickness = 2,
    borderFill = 'rgba(51,51,51,1)',
}) {
    const svg = useMemo(() => drawSVG(shape, Math.min(den, Math.abs(num) % den || den), den, numeratorFill, unfilledFill, thickness, borderFill), [shape, num, den, numeratorFill, unfilledFill, thickness, borderFill]);

    return (
        <div className="fraction-group">
            <div className="unit-stack">
                {Array.from({ length: Math.ceil(Math.abs(num) / den) || 1 }).map((_, i) => {
                    let rem = Math.abs(num) - i * den;
                    const fill = Math.min(den, rem);
                    return (
                        <div key={i} dangerouslySetInnerHTML={{ __html: drawSVG(shape, fill, den, numeratorFill, unfilledFill, thickness, borderFill).outerHTML }} />
                    );
                })}
            </div>
            {!hideLabel && (
                <div className="math-label">
                    <div>
                        {num}
                        {opTop && <span className="op-indicator op-top">{opTop}</span>}
                    </div>
                    <div className="fraction-line"></div>
                    <div>
                        {den}
                        {opBot && <span className="op-indicator op-bot">{opBot}</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

function drawSVG(shape, filled, total, numeratorFill, unfilledFill, thickness = 2, borderFill = 'rgba(51,51,51,1)') {
    const width = 280;
    let height = 280;
    const padding = 20;
    const minBlockSize = 25;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    function getBestGrid(n) {
        const sqrt = Math.sqrt(n);
        if (Number.isInteger(sqrt)) {
            return { cols: sqrt, rows: sqrt };
        }

        const maxCols = 12;
        let bestExact = null;
        for (let c = 2; c <= maxCols; c++) {
            if (n % c === 0) {
                const r = n / c;
                const diff = Math.abs(c - r);
                if (!bestExact || diff < bestExact.diff) {
                    bestExact = { cols: c, rows: r, diff };
                }
            }
        }

        if (bestExact && bestExact.rows > 12 && bestExact.cols <= 4) {
            bestExact = null;
        }

        if (bestExact) return { cols: bestExact.cols, rows: bestExact.rows };

        let c = Math.ceil(Math.sqrt(n));
        if (c > 12) c = 12;
        const r = Math.ceil(n / c);
        return { cols: c, rows: r };
    }

    if (shape === 'rect') {
        const { cols, rows } = getBestGrid(total);

        let cw = (width - padding) / cols;
        let ch = (height - padding) / rows;
        let finalWidth = width;
        let finalHeight = height;

        if (cw < minBlockSize) {
            cw = minBlockSize;
            finalWidth = cols * cw + padding;
        }
        if (ch < minBlockSize) {
            ch = minBlockSize;
            finalHeight = rows * ch + padding;
        }

        svg.setAttribute('width', finalWidth);
        svg.setAttribute('height', finalHeight);
        svg.setAttribute('viewBox', `0 0 ${finalWidth} ${finalHeight}`);

        for (let i = 0; i < total; i++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const col = i % cols;
            const row = Math.floor(i / cols);

            rect.setAttribute('x', padding / 2 + col * cw);
            rect.setAttribute('y', padding / 2 + row * ch);
            rect.setAttribute('width', Math.max(0, cw - thickness));
            rect.setAttribute('height', Math.max(0, ch - thickness));
            rect.setAttribute('fill', i < filled ? numeratorFill : unfilledFill);
            rect.setAttribute('stroke', borderFill);
            rect.setAttribute('stroke-width', thickness.toString());
            rect.setAttribute('rx', '8');
            rect.setAttribute('ry', '8');

            svg.appendChild(rect);
        }
    } else {
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        const cx = width / 2;
        const cy = height / 2;
        const r = width * 0.42 - thickness / 2;

        if (total === 1) {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', cx);
            c.setAttribute('cy', cy);
            c.setAttribute('r', r);
            c.setAttribute('fill', filled >= 1 ? numeratorFill : unfilledFill);
            c.setAttribute('stroke', borderFill);
            c.setAttribute('stroke-width', thickness.toString());
            svg.appendChild(c);
        } else {
            const ang = (2 * Math.PI) / total;
            for (let i = 0; i < total; i++) {
                const sA = i * ang - Math.PI / 2;
                const eA = (i + 1) * ang - Math.PI / 2;
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                let d = `M ${cx} ${cy} `;

                if (shape === 'star') {
                    const outerR = r;
                    const innerR = r * 0.45;
                    const midA = (sA + eA) / 2;
                    d += `L ${cx + outerR * Math.cos(sA)} ${cy + outerR * Math.sin(sA)} L ${cx + innerR * Math.cos(midA)} ${cy + innerR * Math.sin(midA)} L ${cx + outerR * Math.cos(eA)} ${cy + outerR * Math.sin(eA)} Z`;
                } else if (shape === 'poly') {
                    d += `L ${cx + r * Math.cos(sA)} ${cy + r * Math.sin(sA)} L ${cx + r * Math.cos(eA)} ${cy + r * Math.sin(eA)} Z`;
                } else {
                    d += `L ${cx + r * Math.cos(sA)} ${cy + r * Math.sin(sA)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(eA)} ${cy + r * Math.sin(eA)} Z`;
                }

                p.setAttribute('d', d);
                p.setAttribute('fill', i < filled ? numeratorFill : unfilledFill);
                p.setAttribute('stroke', borderFill);
                p.setAttribute('stroke-width', thickness.toString());
                p.setAttribute('stroke-linecap', 'round');
                p.setAttribute('stroke-linejoin', 'round');
                svg.appendChild(p);
            }
        }
    }

    return svg;
}