import React from 'react';

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
    mixed = false, // true: inteiros sem divisões + parte fracionária dividida
}) {
    const absNum = Math.abs(num);

    // Monta a lista de unidades a desenhar
    const units = [];
    if (mixed) {
        const wholes = Math.floor(absNum / den);
        const rem = absNum % den;
        for (let i = 0; i < wholes; i++) {
            units.push({ fill: den, divided: false });
        }
        if (rem > 0 || wholes === 0) {
            units.push({ fill: rem, divided: true });
        }
    } else {
        const count = Math.ceil(absNum / den) || 1;
        for (let i = 0; i < count; i++) {
            units.push({ fill: Math.min(den, absNum - i * den), divided: true });
        }
    }

    return (
        <div className="fraction-group">
            <div className="unit-stack">
                {units.map((u, i) => (
                    <div
                        key={i}
                        dangerouslySetInnerHTML={{
                            __html: drawSVG(shape, u.fill, den, numeratorFill, unfilledFill, thickness, borderFill, u.divided).outerHTML,
                        }}
                    />
                ))}
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

function drawSVG(shape, filled, total, numeratorFill, unfilledFill, thickness = 2, borderFill = 'rgba(51,51,51,1)', divided = true) {
    const width = 280;
    let height = 280;
    const padding = 20;
    const minBlockSize = 25;
    const NS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(NS, 'svg');

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

        if (!divided) {
            // Inteiro: mesmo retângulo externo da grade, sem divisões
            const rect = document.createElementNS(NS, 'rect');
            rect.setAttribute('x', padding / 2);
            rect.setAttribute('y', padding / 2);
            rect.setAttribute('width', Math.max(0, cols * cw - thickness));
            rect.setAttribute('height', Math.max(0, rows * ch - thickness));
            rect.setAttribute('fill', numeratorFill);
            rect.setAttribute('stroke', borderFill);
            rect.setAttribute('stroke-width', thickness.toString());
            rect.setAttribute('rx', '8');
            rect.setAttribute('ry', '8');
            svg.appendChild(rect);
            return svg;
        }

        for (let i = 0; i < total; i++) {
            const rect = document.createElementNS(NS, 'rect');
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

        if (total === 1 || (!divided && shape !== 'star' && shape !== 'poly')) {
            // círculo inteiro (ou fração com den = 1)
            const c = document.createElementNS(NS, 'circle');
            c.setAttribute('cx', cx);
            c.setAttribute('cy', cy);
            c.setAttribute('r', r);
            c.setAttribute('fill', filled >= 1 ? numeratorFill : unfilledFill);
            c.setAttribute('stroke', borderFill);
            c.setAttribute('stroke-width', thickness.toString());
            svg.appendChild(c);
        } else if (!divided) {
            // Inteiro de estrela/polígono: mesmo contorno, mesmo nº de vértices/pontas (= total), sem divisões
            const ang = (2 * Math.PI) / total;
            const innerR = r * 0.45;
            let d = '';

            for (let i = 0; i < total; i++) {
                const a = i * ang - Math.PI / 2;
                const ox = cx + r * Math.cos(a);
                const oy = cy + r * Math.sin(a);
                d += (i === 0 ? 'M' : 'L') + ` ${ox} ${oy} `;

                if (shape === 'star') {
                    const midA = a + ang / 2;
                    d += `L ${cx + innerR * Math.cos(midA)} ${cy + innerR * Math.sin(midA)} `;
                }
            }
            d += 'Z';

            const p = document.createElementNS(NS, 'path');
            p.setAttribute('d', d);
            p.setAttribute('fill', numeratorFill);
            p.setAttribute('stroke', borderFill);
            p.setAttribute('stroke-width', thickness.toString());
            p.setAttribute('stroke-linecap', 'round');
            p.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(p);
        } else {
            const ang = (2 * Math.PI) / total;
            for (let i = 0; i < total; i++) {
                const sA = i * ang - Math.PI / 2;
                const eA = (i + 1) * ang - Math.PI / 2;
                const p = document.createElementNS(NS, 'path');
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
