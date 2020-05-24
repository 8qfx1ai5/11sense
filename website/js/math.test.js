const { findFractions } = require("./math");

test("double decimal places", () => {
    const output = findFractions("0.54", 2, "0.035", 3);
    expect(output).toBeNaN();
})