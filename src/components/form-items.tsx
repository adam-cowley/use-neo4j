import React, { FormEvent } from 'react'

interface FormInputProps {
    classNames: Record<string, any>;
    id: string;
    label: string;
    type?: string;
    value: any;
    setter: Function;
}

export const FormInput: React.FC<FormInputProps> = ({ classNames, id, label, type, value, setter }) => {
    return (
        <div className={classNames.formGroup}>
            <label htmlFor={id}>{label}</label>
            <input className={classNames.formInput} id={id} type={type || 'text'} value={value} onChange={e => setter(e.target.value)} />
        </div>
    )
}

interface FormSelectProps {
    classNames: Record<string, any>;
    id: string;
    label: string;
    options: any[];
    value: any;
    setter: Function;
}

export const FormSelect: React.FC<FormSelectProps> = ({ classNames, id, label, options, setter, ...props}) => {
    const handleChange = (e: FormEvent<HTMLSelectElement>) => {
        setter(options.find(v => v.key == e.currentTarget.value))
    }

    return (
        <div className={classNames.formGroup}>
            <label htmlFor={id}>{label}</label>
            <select className={classNames.formInput} id={id} value={props.value.key} onChange={e => handleChange(e)}>
                {options.map(({text, key}) => (<option key={key} value={key} >
                    {text || key}
                </option>))}
            </select>
        </div>
    )
}

interface FormButtonProps {
    className: string;
    text: string;
    onClick: Function;
}

export const FormButton: React.FC<FormButtonProps> = ({ className, text, onClick }) => {
    const handleClick = (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault()

        onClick()
    }

    return (
        <button className={className} onClick={(e) => handleClick(e)}>
            {text}
        </button>
    )
}