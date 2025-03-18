import styles from "./inputBox.module.css";

function InputBox({
  label,
  name,
  type,
  disabled,
  placeholder,
  value,
  handleChange,
  error,
  style,
}) {
  return (
    <div className={styles.inputContainer}>
      <label htmlFor={name}>
        <p>{label}</p>
      </label>
      <input
        id={name}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e, name)}
        style={style}
      />
      {error && <p className={styles.error}>*{error}</p>}
    </div>
  );
}

export default InputBox;
