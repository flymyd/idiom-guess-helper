import idiomsDict from '../assets/cleaned_idiom.min.json';

function parsePattern(pattern) {
    return pattern.split(',').map(p => p.trim());
}

function matchPinyin(pattern, target) {
    if (pattern === target) {
        return true;
    }

    if (pattern === 'X-X' || pattern === "X'X-X") {
        return true;
    }

    const patternParts = pattern.includes("'") ? pattern.split("'") : [pattern];
    const targetParts = target.includes("'") ? target.split("'") : [target];

    if (patternParts.length === 1 && targetParts.length > 1) {
        return false;
    }

    if (patternParts.length > 1 && targetParts.length === 1) {
        return false;
    }

    if (patternParts.length === 1) {
        const [pSyllable, pTone] = patternParts[0].split('-');
        const [tSyllable, tTone] = targetParts[0].split('-');
        return (pSyllable === 'X' || pSyllable === tSyllable) &&
               (pTone === 'X' || pTone === tTone);
    }

    const [pInitial, pRest] = patternParts;
    const [tInitial, tRest] = targetParts;

    const [pFinal, pTone] = pRest.split('-');
    const [tFinal, tTone] = tRest.split('-');

    if (pInitial !== 'X' && pInitial !== tInitial) {
        return false;
    }

    if (pFinal !== 'X' && pFinal !== tFinal) {
        return false;
    }

    if (pTone !== 'X' && pTone !== tTone) {
        return false;
    }

    return true;
}

export function findMatchingIdioms(pattern, idioms) {
    const patternParts = parsePattern(pattern);
    if (patternParts.length !== 4) {
        return [];
    }

    const matches = [];
    for (const idiom of idioms) {
        if (idiom.p.length !== 4) {
            continue;
        }

        const isMatch = patternParts.every((patternPart, index) =>
            matchPinyin(patternPart, idiom.p[index])
        );

        if (isMatch) {
            matches.push({
                word: idiom.w,
                pinyin: idiom.po,
                split_pinyin: idiom.p
            });
        }
    }

    return matches;
}

function main() {
    const idioms = idiomsDict;
    const testPattern = "l'X-2,X'X-X,X'X-1,X'ai-2";
    console.log(`\n测试模式: ${testPattern}`);
    const matches = findMatchingIdioms(testPattern, idioms);
    console.log(`找到 ${matches.length} 个匹配:`);
    matches.forEach((match, index) => {
        console.log(`\n${index + 1}. ${match.word}`);
        console.log(`   拼音: ${match.pinyin}`);
        console.log(`   拆分: ${match.split_pinyin}`);
    });
}
