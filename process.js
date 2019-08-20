const lodash = require('lodash');
const random = require('random');

////////////////////////////////////////////////////////////////////////////////////////////////
/// Constants

// Strength
const strMax = 100;
const strMin = 0;
const strOffset = 2;

//Intelligence
const intMax = 100;
const intMin = 0;
const intOffset = 2;

//HP
const hpMax = 90;
const hpMin = 50;
const hpException = 100;

//MP
const mpMax = 50;
const mpMin = 20;

// Roughly speaking, every 3 power difference => 1 SA level difference
const strOrIntDifferenceForSALevel = 3;
// stronger => smaller index => better superAttack
// TODO: need to customize here, stronger one first, weaker one next
const superAttackPriority = ['1', '2', '3', '4', '5', '6', '7', '8'];

////////////////////////////////////////////////////////////////////////////////////////////////
/// Methods

const createStrOrInt = (value, max, min, offset) => {
    const num = lodash.clamp(Number(value), min, max - offset);
    const randomNum = random.int(-offset, offset)
    const newNum = lodash.clamp(num + randomNum, min, max);
    return newNum.toString();
};

const createHPOrMP = (value, max, min, Comparator, valueException) => {
    if(valueException)
        return value;
    const difference = max - min;
    const ratio = Number(value) / Comparator;
    const deduction = Math.floor(difference * Math.cos(Math.PI/2 * ratio));
    return (max - deduction).toString();
}

const createSuperAttack = (Strength, Intelligence) => {
    const strDifference = strMax - Number(Strength);
    const intDifferernce = intMax - Number(Intelligence);
    const difference = Math.min(strDifference, intDifferernce);
    const levelOffset = Math.ceil(difference / strOrIntDifferenceForSALevel);
    const adjustedLevelOffset = random.boolean() ? levelOffset - 1 : levelOffset;
    if(adjustedLevelOffset >= superAttackPriority.length)
        return '';
    const realLevelOffset = lodash.clamp(adjustedLevelOffset, 0, superAttackPriority.length - 1);
    return superAttackPriority[realLevelOffset];
}

const createSoliderTypes = () => {
    const firstPart = lodash.repeat(random.int(0, 8).toString(), 4);
    const nextPart = lodash.repeat(random.int(0, 8).toString(), 4);
    return (firstPart+nextPart).split('').join(',');
};

////////////////////////////////////////////////////////////////////////////////////////////////
/// Module

module.exports = {
    dataProcessor: data => data.map((item, index) => {
        const Strength = createStrOrInt(item.Strength, strMax, strMin, strOffset);
        const Intelligence = createStrOrInt(item.Intelligence, intMax, intMin, intOffset);
        // HP is based on computed Strength
        const isHPAnException = Number(item.HP) >= hpException;
        const HP = createHPOrMP(Strength, hpMax, hpMin, strMax, isHPAnException);
        // MP is based on computed Strength
        const MP = createHPOrMP(Intelligence, mpMax, mpMin, intMax);   
        const Weapon = '';
        // SuperAttack is based on Strength or Intelligence, determined by larger one
        const SuperAttack = createSuperAttack(Strength, Intelligence);
        const SoldierType = createSoliderTypes();

        return {
            ...item,
            Strength,
            Intelligence,
            HP,
            MP,
            Weapon,
            SuperAttack,
            SoldierType
        };
    })
};
