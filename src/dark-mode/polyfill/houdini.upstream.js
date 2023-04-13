const _value = new WeakMap();

class CSSKeywordValue {
  get value() {
    return _value.get(this);
  }

  set value(newValue) {
    _value.set(this, String(newValue));
  }

  toString() {
    return `${this.value}`;
  }

  constructor(...args) {
    if (args.length < 1) {
      throw new TypeError(
        `Failed to construct 'CSSKeywordValue': 1 arguments required, but only ${args.length} present.`
      );
    }

    _value.set(this, String(args[0]));
  }
}

Object.defineProperties(CSSKeywordValue.prototype, {
  value: { enumerable: true },
});

const _value$1 = new WeakMap();

class CSSMathInvert {
  get operator() {
    return "invert";
  }

  get value() {
    return _value$1.get(this);
  }

  toString() {
    return `calc(1 / ${_value$1.get(this)})`;
  }

  constructor(value) {
    _value$1.set(this, value);
  }
}

const _values = new WeakMap();

class CSSMathMax {
  get operator() {
    return "max";
  }

  get values() {
    return _values.get(this);
  }

  toString() {
    return `max(${_values.get(this).join(", ")})`;
  }

  constructor(...values) {
    _values.set(this, values);
  }
}

const _values$1 = new WeakMap();

class CSSMathMin {
  get operator() {
    return "min";
  }

  get values() {
    return _values$1.get(this);
  }

  toString() {
    return `min(${_values$1.get(this).join(", ")})`;
  }

  constructor(...values) {
    _values$1.set(this, values);
  }
}

const _values$2 = new WeakMap();

class CSSMathProduct {
  get operator() {
    return "product";
  }

  get values() {
    return _values$2.get(this);
  }

  toString() {
    return `calc(${_values$2
      .get(this)
      .reduce(
        (contents, value) =>
          `${
            value instanceof CSSMathInvert
              ? `${contents ? `${contents} / ` : "1 / "}${value.value}`
              : `${contents ? `${contents} * ` : ""}${value}`
          }`,
        ""
      )})`;
  }

  constructor(...values) {
    _values$2.set(this, values);
  }
}

const _values$3 = new WeakMap();

class CSSMathSum {
  get operator() {
    return "product";
  }

  get values() {
    return _values$3.get(this);
  }

  toString() {
    return `calc(${_values$3
      .get(this)
      .reduce((contents, value) => `${contents ? `${contents} + ` : ""}${value}`, "")})`;
  }

  constructor(...values) {
    _values$3.set(this, values);
  }
}

class CSSStyleValue {
  constructor() {
    throw new TypeError("Illegal constructor");
  }
}

const units = {
  number: "",
  percent: "%",
  em: "em",
  ex: "ex",
  ch: "ch",
  rem: "rem",
  vw: "vw",
  vh: "vh",
  vmin: "vmin",
  vmax: "vmax",
  cm: "cm",
  mm: "mm",
  in: "in",
  pt: "pt",
  pc: "pc",
  px: "px",
  Q: "Q",
  deg: "deg",
  grad: "grad",
  rad: "rad",
  turn: "turn",
  s: "s",
  ms: "ms",
  Hz: "Hz",
  kHz: "kHz",
  dpi: "dpi",
  dpcm: "dpcm",
  dppx: "dppx",
  fr: "fr",
};

class CSSNumericValue {
  add(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (const arg of args) {
      if (arg instanceof Constructor) {
        if (values.length || result.unit !== arg.unit) {
          values.push(arg);
        } else {
          result.value += arg.value;
        }
      } else if (
        arg instanceof CSSMathProduct ||
        arg instanceof CSSMathMax ||
        arg instanceof CSSMathMin ||
        arg instanceof CSSMathInvert
      ) {
        values.push(arg);
      } else {
        return null;
      }
    }

    return values.length ? new CSSMathSum(result, ...values) : result;
  }

  div(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (let arg of args) {
      if (typeof arg === "number") {
        arg = new CSSUnitValue(arg, "number");
      }

      if (arg instanceof Constructor) {
        if (values.length || (result.unit !== arg.unit && arg.unit !== "number")) {
          values.push(arg);
        } else {
          result.value /= arg.value;
        }
      } else {
        return null;
      }
    }

    return values.length
      ? new CSSMathProduct(result, ...values.map(value => new CSSMathInvert(value)))
      : result;
  }

  max(...args) {
    const result = new CSSUnitValue(this.value, this.unit);
    const values = [result];

    for (const arg of args) {
      if (arg instanceof CSSUnitValue) {
        if (values.length > 1 || result.unit !== arg.unit) {
          values.push(arg);
        } else {
          result.value = Math.max(result.value, arg.value);
        }
      } else {
        return null;
      }
    }

    return values.length > 1 ? new CSSMathMax(...values) : result;
  }

  min(...args) {
    const result = new CSSUnitValue(this.value, this.unit);
    const values = [result];

    for (const arg of args) {
      if (arg instanceof CSSUnitValue) {
        if (values.length > 1 || result.unit !== arg.unit) {
          values.push(arg);
        } else {
          result.value = Math.min(result.value, arg.value);
        }
      } else {
        return null;
      }
    }

    return values.length > 1 ? new CSSMathMin(...values) : result;
  }

  mul(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (let arg of args) {
      if (typeof arg === "number") {
        arg = new CSSUnitValue(arg, "number");
      }

      if (arg instanceof Constructor) {
        if (values.length || (result.unit !== arg.unit && arg.unit !== "number")) {
          values.push(arg);
        } else {
          result.value *= arg.value;
        }
      } else {
        return null;
      }
    }

    return values.length ? new CSSMathProduct(result, ...values) : result;
  }

  sub(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (const arg of args) {
      if (arg instanceof Constructor) {
        if (values.length || result.unit !== arg.unit) {
          values.push(new Constructor(arg.value * -1, arg.unit));
        } else {
          result.value -= arg.value;
        }
      } else {
        return null;
      }
    }

    return values.length ? new CSSMathSum(result, ...values) : result;
  }
}

const _value$2 = new WeakMap();
const _unit = new WeakMap();

class CSSUnitValue extends CSSNumericValue {
  get value() {
    return _value$2.get(this);
  }

  set value(newValue) {
    _value$2.set(this, getFiniteNumber(newValue));
  }

  get unit() {
    return _unit.get(this);
  }

  toString() {
    return `${this.value}${units[this.unit]}`;
  }

  constructor(...args) {
    super();

    if (args.length < 2) {
      throw new TypeError(
        `Failed to construct 'CSSUnitValue': 2 arguments required, but only ${args.length} present.`
      );
    }

    _value$2.set(this, getFiniteNumber(args[0]));
    _unit.set(this, getUnit(args[1]));
  }
}

Object.defineProperties(CSSUnitValue.prototype, {
  value: { enumerable: true },
  unit: { enumerable: true },
});

function getFiniteNumber(value) {
  if (isNaN(value) || Math.abs(value) === Infinity) {
    throw new TypeError(
      `Failed to set the 'value' property on 'CSSUnitValue': The provided double value is non-finite.`
    );
  }

  return Number(value);
}

function getUnit(unit) {
  if (!Object.keys(units).includes(unit)) {
    throw new TypeError(`Failed to construct 'CSSUnitValue': Invalid unit: ${unit}`);
  }

  return unit;
}

const parseAsValue = string => {
  const unitParsingMatch = String(string).match(unitParsingMatcher);

  if (unitParsingMatch) {
    const [, value, unit] = unitParsingMatch;

    return new CSSUnitValue(value, unitKeys[unitValues.indexOf(unit || "")]);
  }

  return new CSSKeywordValue(string);
};

const unitKeys = Object.keys(units);
const unitValues = Object.values(units);
const unitParsingMatcher = new RegExp(
  `^([-+]?[0-9]*\.?[0-9]+)(${unitValues.join("|")})?$`
);

class StylePropertyMap {
  get(...args) {
    if (args.length < 1) {
      throw new TypeError(
        `Failed to execute 'get' on 'StylePropertyMapReadOnly': 1 argument required, but only ${args.length} present.`
      );
    }

    const [property] = args;
    const value = this.style[property];

    if (value) {
      return parseAsValue(value);
    }

    return null;
  }

  set(...args) {
    if (args.length < 2) {
      throw new TypeError(
        `Failed to execute 'set' on 'StylePropertyMap': 2 arguments required, but only ${args.length} present.`
      );
    }

    const [property, value] = args;

    this.style[property] = String(value);
  }

  constructor() {
    throw new TypeError("Illegal constructor");
  }
}

function polyfill(window) {
  if (!window.CSS) window.CSS = class CSS {};

  Object.keys(units).forEach(unit => {
    if (!(unit in window.CSS)) {
      window.CSS[unit] = value => new CSSUnitValue(value, unit);
    }
  });

  defineProperty(window.CSSRule.prototype, "styleMap", context => context.style);

  defineProperty(window.Element.prototype, "attributeStyleMap", context => context.style);

  defineProperty(window.Element.prototype, "computedStyleMap", context =>
    getComputedStyle(context)
  );

  if (!window.CSSKeywordValue) window.CSSKeywordValue = CSSKeywordValue;
  if (!window.CSSMathInvert) window.CSSMathInvert = CSSMathInvert;
  if (!window.CSSMathMax) window.CSSMathMax = CSSMathMax;
  if (!window.CSSMathMin) window.CSSMathMin = CSSMathMin;
  if (!window.CSSMathProduct) window.CSSMathProduct = CSSMathProduct;
  if (!window.CSSMathSum) window.CSSMathSum = CSSMathSum;
  if (!window.CSSStyleValue) window.CSSStyleValue = CSSStyleValue;
  if (!window.CSSUnitValue) window.CSSUnitValue = CSSUnitValue;
  if (!window.StylePropertyMap) window.StylePropertyMap = StylePropertyMap;

  function defineProperty(prototype, property, getStyle) {
    if (!(property in prototype)) {
      Object.defineProperty(prototype, property, {
        configurable: true,
        enumerable: true,
        get() {
          const computedStyleMap = Object.create(StylePropertyMap.prototype);

          computedStyleMap.style = getStyle(this);

          return computedStyleMap;
        },
      });
    }
  }
}

export default polyfill;
