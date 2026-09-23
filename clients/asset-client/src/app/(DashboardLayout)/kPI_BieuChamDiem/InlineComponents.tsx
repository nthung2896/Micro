import React from "react";
import { Input, InputNumber, Tooltip, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export const InlineInput = React.memo(({ value, onChange, placeholder, autoSize = false, type = 'text', style, rows, disabled, readOnly }: any) => {
  const [val, setVal] = React.useState(value ?? "");
  const isFocusedRef = React.useRef(false);
  const inputRef = React.useRef<any>(null);
  const debounceTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!isFocusedRef.current) {
      setVal(value ?? "");
    }
  }, [value]);

  const handleChange = (e: any) => {
    isFocusedRef.current = true;
    const newVal = e.target.value;
    setVal(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (newVal !== value && onChange) {
        onChange(newVal);
      }
    }, 350);
  };

  const handleFocus = (e: React.FocusEvent<any>) => {
    isFocusedRef.current = true;
    if (val === "" || val === "0") {
      requestAnimationFrame(() => {
        e.target?.select?.();
      });
    }
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    isFocusedRef.current = false;
    if (val !== value && onChange) {
      onChange(val);
    }
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    if (isFocusedRef.current && inputRef.current) {
      const domEl = inputRef.current.resizableTextArea?.textArea || inputRef.current.input || inputRef.current;
      if (domEl && document.activeElement !== domEl) {
        domEl.focus?.();
      }
    }
  });

  if (type === 'textarea') {
    return (
      <Input.TextArea
        ref={inputRef}
        autoSize={autoSize}
        placeholder={placeholder}
        value={val}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={style}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
      />
    );
  }
  return (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      value={val}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={style}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
});

export const InlineInputNumber = React.memo(({
  value,
  onChange,
  placeholder,
  style,
  onCalculate,
  disabled,
  min,
  max,
  clampToBounds = false,
  precision = 2,
  step = 0.01,
  ...rest
}: any) => {
  const clampToInputBounds = (num: number) => {
    const minValue = Number(min);
    const maxValue = Number(max);
    const boundedMin = clampToBounds && Number.isFinite(minValue) ? Math.max(minValue, num) : num;
    return clampToBounds && Number.isFinite(maxValue) ? Math.min(maxValue, boundedMin) : boundedMin;
  };

  const sanitizeValue = (v: any) => {
    if (v === null || v === undefined || v === "") return undefined;
    const num = Number(v);
    if (!Number.isFinite(num)) return v;
    return Number(clampToInputBounds(num).toFixed(precision));
  };

  const [val, setVal] = React.useState<any>(() => sanitizeValue(value));
  const isFocusedRef = React.useRef(false);
  const inputRef = React.useRef<any>(null);
  const debounceTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!isFocusedRef.current) {
      setVal(sanitizeValue(value));
    }
  }, [value, precision, min, max, clampToBounds]);

  const handleChange = (v: any) => {
    isFocusedRef.current = true;
    const cleanVal = sanitizeValue(v);
    setVal(cleanVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        onChange(cleanVal);
      }
    }, 350);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    if (val === 0 || val === "0") {
      requestAnimationFrame(() => {
        e.target?.select?.();
      });
    }
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    isFocusedRef.current = false;
    const cleanVal = sanitizeValue(val);
    setVal(sanitizeValue(cleanVal));
    if (cleanVal !== value && onChange) {
      onChange(cleanVal);
    }
    if (onCalculate) {
      onCalculate();
    }
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  React.useLayoutEffect(() => {
    if (isFocusedRef.current && inputRef.current) {
      const domInput = inputRef.current.input || inputRef.current.nativeElement || inputRef.current;
      if (domInput && document.activeElement !== domInput) {
        domInput.focus?.();
      }
    }
  });

  return (
    <InputNumber
      ref={inputRef}
      placeholder={placeholder}
      value={val}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      precision={precision}
      step={step}
      formatter={(v) => {
        if (v === null || v === undefined || v === "") return "";
        const num = Number(v);
        if (!Number.isFinite(num)) return `${v}`;
        return Number(num.toFixed(precision)).toString();
      }}
      parser={(displayValue) => {
        if (!displayValue) return "";
        const clean = displayValue.replace(/,/g, ".");
        const num = Number(clean);
        return Number.isFinite(num) ? sanitizeValue(num) : clean;
      }}
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1.5px solid #1677ff',
        borderRadius: '4px',
        fontWeight: 600,
        color: '#0f172a',
        textAlign: 'center',
        ...style
      }}
      disabled={disabled}
      min={min}
      max={max}
      {...rest}
    />
  );
});

export const TieuChiSuggestor = ({ value, onClick, onClear }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Input.TextArea
          style={{ flex: 1 }}
          autoSize={{ minRows: 1, maxRows: 4 }}
          placeholder="Chọn tiêu chí..."
          value={value}
          onClick={onClick}
          readOnly
        />
        {value && onClear ? (
          <Tooltip title="Xóa tiêu chí đã chọn">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            />
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};
