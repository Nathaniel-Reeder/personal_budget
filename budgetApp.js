import fs from "fs"
import { DateTime } from "luxon";

// Input the balance on payday

const payDayBalance = 984.28

// Figure out what day it is

const currentDate = DateTime.now();

let currentDay = parseInt(currentDate.toFormat("dd")); // Day of the month formatted to 2 digits (02)

// Get the bill data from the json file
const billData = JSON.parse(fs.readFileSync("./bills.json", "utf8"));
const {rent, rentersInsurance, gas, carInsurance, theForge, phone, wowSub, carPayment, gym, inkarnate, hulu, personalTraining, otherApartmentBills} = billData
const billArray = [rent, rentersInsurance, gas, carInsurance, theForge, phone, wowSub, carPayment, gym, inkarnate, hulu, personalTraining, otherApartmentBills]

// Split bills into their associated pay periods

let postTenBills = [];
let postTwentyFiveBills = [];

billArray.forEach(billObj => {
    if (parseInt(billObj.dueDate) >= 10 && parseInt(billObj.dueDate) < 25) {
        postTenBills.push(billObj);
    } else {
        postTwentyFiveBills.push(billObj);
    }
});

// Function to handle bi-weekly Wednesday bills for personal training
const isPaymentWednesday = (date) => {
    const referenceDate = DateTime.fromISO('2025-04-02'); // A reference Wednesday where the bill occurs
    const diff = Math.floor(date.diff(referenceDate, 'weeks').weeks);
    return date.weekday === 3 && diff % 2 === 0;
}

// Get start and end dates for the current pay period
let periodStart, periodEnd;

if(currentDay >= 10 && currentDay < 25) {
    periodStart = currentDate.set({ day: 10 })
    periodEnd = currentDate.set( { day: 24 })
} else {
    periodStart = (currentDate.day < 10) ? // Sets the variable based on how the condition evaluates
        currentDate.set({day:25}).minus({months: 1}) : // Set this if true
        currentDate.set({day:25}); // Sets this if false
    periodEnd = (currentDate.day < 10) ?
        currentDate.set({day: 10}) :
        currentDate.set({day:10}).plus({months: 1})
}

// Check how many Wednesdays in this period are a payment Wednesday
let paymentWednesdayCount = 0;
let current = periodStart;
while (current <= periodEnd) {
    if (isPaymentWednesday(current)) {
        paymentWednesdayCount++;
    }
    current = current.plus({ days: 1 });
}

let payPeriodTotal = 0;
let balanceRemaining = 0;

// Create a function to calculate the bill for each pay period
const calculateBills = function(payPeriodArray) {

    if(paymentWednesdayCount > 0) {
        let personalTrainerPayment = 120 * paymentWednesdayCount;
        console.log(`     Personal Trainer(${paymentWednesdayCount}): ${personalTrainerPayment}`);
        payPeriodTotal += personalTrainerPayment;
    }

    payPeriodArray.forEach(billObj => {
        console.log(`     ${billObj.name}: ${billObj.amount}`);
        payPeriodTotal += billObj.amount;
    });
}

// Figure out expected pay for the next pay period
const dailyNetPay = 147.84
let nextPeriodPay = 0;
let nextPeriodStart, nextPeriodEnd;

if (currentDay >= 10 && currentDay < 25) {
    nextPeriodStart = currentDate.set({day: 25});
    nextPeriodEnd = currentDate.plus({months: 1}).set({day: 9});
} else {
    nextPeriodStart = (currentDate.day < 10) ?
        currentDate.set({day: 10}) :
        currentDate.plus({months: 1}).set({day: 10});
    nextPeriodEnd = (currentDate.day < 10) ?
        currentDate.set({day: 24}) :
        currentDate.plus({months: 1}).set({day: 24})
}

let futureCurrent = nextPeriodStart;
while(futureCurrent <= nextPeriodEnd) {
    if (!(futureCurrent.weekday === 1 || futureCurrent.weekday === 7)) {
        nextPeriodPay = nextPeriodPay + dailyNetPay;
    }
    futureCurrent = futureCurrent.plus({ days: 1 });
};

// Do diffent things depending on what pay period it is
if (currentDay >= 10 && currentDay < 25) {
    console.log("Pay period is the 10th through 25th");
    console.log("Bills due:");

    calculateBills(postTenBills);

    balanceRemaining = payDayBalance - payPeriodTotal

    console.log(`Pay Period total due: ${payPeriodTotal}`);
    console.log(`Payday balance: ${payDayBalance}`);
    console.log(`Balance Remaining: ${balanceRemaining}`);

    payPeriodTotal = 0;

    console.log("Bills due next pay period:");
    calculateBills(postTwentyFiveBills);
    console.log(`Next Pay Period Total: ${payPeriodTotal}`);
    console.log(`Expected Pay: ${(nextPeriodPay).toFixed(2)}`);
    if (payPeriodTotal > nextPeriodPay) {
        console.log(`Expect to save ${(payPeriodTotal - nextPeriodPay).toFixed(2)} from this pay check for future bills.`);
    }
} else {
    console.log("Pay period is the 25th through 10th");
    calculateBills(postTwentyFiveBills);

    payPeriodTotal = 0;

    console.log("Bills due next pay period:");
    calculateBills(postTenBills);
    console.log(`Next Pay Period Total: ${payPeriodTotal}`);
    console.log(`Expected Pay: ${(nextPeriodPay).toFixed(2)}`);
    if (payPeriodTotal > nextPeriodPay) {
        console.log(`Expect to save ${(payPeriodTotal - nextPeriodPay).toFixed(2)} from this pay check for future bills.`);
    }
}