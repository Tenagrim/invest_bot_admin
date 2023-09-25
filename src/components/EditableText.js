import {useState} from "react";
import * as React from "react";

export default function EditableText(props){
    // let text = props.initialText;
    // const setText =(t)=>{text = t;};
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(props.initialText);


    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (text !== props.initialText)
            props.setText(text)
        // Save the changes or perform any required actions here
    };
    const _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur()
        }
    }

    return (
        <div onClick={handleDoubleClick} className={props.setClass}>
            {isEditing ? (
                <input className='w-100 text-center'
                       type="text"
                       value={text}
                       onChange={handleChange}
                       onBlur={handleBlur}
                       onKeyDown={_handleKeyDown}
                />
            ) : (
                <span>{text}</span>
            )}
        </div>
    );
};