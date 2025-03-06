import React, { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';

const TextEditor = ({ placeholder, onChange }) => {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const config = useMemo(() => ({
        readonly: false,
        placeholder: placeholder || 'Start typing...',
    }), [placeholder]);

    const handleContentChange = (newContent) => {
        setContent(newContent);
        
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;
        const plainText = tempDiv.innerText;

        if (onChange) {
            onChange(plainText);
        }
    };

    return (
        <JoditEditor
            ref={editor}
            value={content}
            config={config}
            tabIndex={1}
            onBlur={handleContentChange}
            onChange={newContent => { }}
        />
    );
};

export default TextEditor;