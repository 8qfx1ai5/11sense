const m = require("./math");

test("double decimal places", () => {
    let output = m.findFractions("0.54", 2, "0.035", 3);
    expect(output.size).toBe(9);
});