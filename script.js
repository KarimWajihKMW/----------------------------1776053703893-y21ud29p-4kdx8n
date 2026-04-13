document.addEventListener('DOMContentLoaded', () => {
    const num1Input = document.getElementById('num1');
    const den1Input = document.getElementById('den1');
    const num2Input = document.getElementById('num2');
    const den2Input = document.getElementById('den2');
    const operationSelect = document.getElementById('operation');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const expressionBox = document.getElementById('expressionBox');
    const resultBox = document.getElementById('resultBox');

    const operationSymbols = {
        add: '+',
        subtract: '−',
        multiply: '×',
        divide: '÷'
    };

    function cleanValue(value) {
        return value.trim() || '0';
    }

    function wrap(value) {
        return `(${value})`;
    }

    function buildFraction(numerator, denominator) {
        return `${wrap(numerator)} / ${wrap(denominator)}`;
    }

    function removeOuterParentheses(value) {
        const trimmed = value.trim();

        if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
            return trimmed;
        }

        let depth = 0;
        for (let i = 0; i < trimmed.length; i++) {
            const char = trimmed[i];
            if (char === '(') depth++;
            if (char === ')') depth--;

            if (depth === 0 && i < trimmed.length - 1) {
                return trimmed;
            }
        }

        return trimmed.slice(1, -1).trim();
    }

    function splitTopLevel(expression, operator) {
        const parts = [];
        let current = '';
        let depth = 0;

        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            if (char === '(') depth++;
            if (char === ')') depth--;

            if (char === operator && depth === 0) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts;
    }

    function simplifyExpression(expression) {
        let simplified = expression.trim().replace(/\s+/g, ' ');

        while (simplified.startsWith('(') && simplified.endsWith(')')) {
            const unwrapped = removeOuterParentheses(simplified);
            if (unwrapped === simplified) break;
            simplified = unwrapped;
        }

        const multiplicativeParts = splitTopLevel(simplified, '*').map(removeOuterParentheses);
        if (multiplicativeParts.length > 1) {
            const counts = new Map();
            const orderedParts = [];

            multiplicativeParts.forEach((part) => {
                const normalized = part.trim();
                if (!counts.has(normalized)) {
                    counts.set(normalized, 0);
                    orderedParts.push(normalized);
                }
                counts.set(normalized, counts.get(normalized) + 1);
            });

            const rebuilt = orderedParts.map((part) => {
                const count = counts.get(part);
                return count > 1 ? `${part}^${count}` : part;
            }).join(' * ');

            return rebuilt;
        }

        return simplified;
    }

    function simplifyFractionResult(numerator, denominator) {
        const numeratorParts = splitTopLevel(numerator, '*').map(removeOuterParentheses);
        const denominatorParts = splitTopLevel(denominator, '*').map(removeOuterParentheses);
        const denominatorCounts = new Map();

        denominatorParts.forEach((part) => {
            denominatorCounts.set(part, (denominatorCounts.get(part) || 0) + 1);
        });

        const remainingNumerator = [];
        numeratorParts.forEach((part) => {
            const count = denominatorCounts.get(part) || 0;
            if (count > 0) {
                denominatorCounts.set(part, count - 1);
            } else {
                remainingNumerator.push(part);
            }
        });

        const remainingDenominator = [];
        denominatorParts.forEach((part) => {
            const count = denominatorCounts.get(part) || 0;
            if (count > 0) {
                remainingDenominator.push(part);
                denominatorCounts.set(part, count - 1);
            }
        });

        return {
            numerator: simplifyExpression(remainingNumerator.length ? remainingNumerator.join(' * ') : '1'),
            denominator: simplifyExpression(remainingDenominator.length ? remainingDenominator.join(' * ') : '1')
        };
    }

    function calculateResult(num1, den1, num2, den2, operation) {
        switch (operation) {
            case 'add':
                return {
                    numerator: `${wrap(num1)}*${wrap(den2)} + ${wrap(num2)}*${wrap(den1)}`,
                    denominator: `${wrap(den1)}*${wrap(den2)}`
                };
            case 'subtract':
                return {
                    numerator: `${wrap(num1)}*${wrap(den2)} - ${wrap(num2)}*${wrap(den1)}`,
                    denominator: `${wrap(den1)}*${wrap(den2)}`
                };
            case 'multiply':
                return {
                    numerator: `${wrap(num1)}*${wrap(num2)}`,
                    denominator: `${wrap(den1)}*${wrap(den2)}`
                };
            case 'divide':
                return {
                    numerator: `${wrap(num1)}*${wrap(den2)}`,
                    denominator: `${wrap(den1)}*${wrap(num2)}`
                };
            default:
                return {
                    numerator: '0',
                    denominator: '1'
                };
        }
    }

    function renderCalculation() {
        const num1 = cleanValue(num1Input.value);
        const den1 = cleanValue(den1Input.value);
        const num2 = cleanValue(num2Input.value);
        const den2 = cleanValue(den2Input.value);
        const operation = operationSelect.value;
        const symbol = operationSymbols[operation];

        if (den1 === '0' || den2 === '0') {
            expressionBox.innerHTML = 'لا يمكن أن يكون المقام صفراً.';
            resultBox.innerHTML = 'يرجى تعديل المقام ثم إعادة المحاولة.';
            return;
        }

        if (operation === 'divide' && num2 === '0') {
            expressionBox.innerHTML = `${buildFraction(num1, den1)} ${symbol} ${buildFraction(num2, den2)}`;
            resultBox.innerHTML = 'لا يمكن القسمة على مقدار بسطه يساوي صفراً.';
            return;
        }

        const result = calculateResult(num1, den1, num2, den2, operation);
        const simplifiedResult = simplifyFractionResult(result.numerator, result.denominator);

        expressionBox.innerHTML = `
            <div>
                <div class="font-bold text-slate-700 mb-2">${buildFraction(num1, den1)} ${symbol} ${buildFraction(num2, den2)}</div>
                <div class="text-sm text-slate-500">تم تكوين الناتج مع تبسيط آلي للعوامل المشتركة عند الإمكان.</div>
            </div>
        `;

        resultBox.innerHTML = `
            <div>
                <div class="text-sm text-slate-500 font-semibold mb-2">الناتج المبسّط</div>
                <div class="text-indigo-700">${buildFraction(simplifiedResult.numerator, simplifiedResult.denominator)}</div>
            </div>
        `;
    }

    calculateBtn.addEventListener('click', renderCalculation);

    resetBtn.addEventListener('click', () => {
        num1Input.value = '';
        den1Input.value = '';
        num2Input.value = '';
        den2Input.value = '';
        operationSelect.value = 'add';
        expressionBox.innerHTML = 'أدخل القيم ثم اضغط على زر <span class="font-bold mx-1">احسب النتيجة</span>';
        resultBox.innerHTML = 'النتيجة ستظهر هنا';
    });
});