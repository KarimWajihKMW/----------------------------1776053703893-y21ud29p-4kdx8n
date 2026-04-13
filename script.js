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

        expressionBox.innerHTML = `
            <div>
                <div class="font-bold text-slate-700 mb-2">${buildFraction(num1, den1)} ${symbol} ${buildFraction(num2, den2)}</div>
                <div class="text-sm text-slate-500">تم تكوين الناتج جبرياً دون تبسيط آلي.</div>
            </div>
        `;

        resultBox.innerHTML = `
            <div>
                <div class="text-sm text-slate-500 font-semibold mb-2">الناتج</div>
                <div class="text-indigo-700">${buildFraction(result.numerator, result.denominator)}</div>
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