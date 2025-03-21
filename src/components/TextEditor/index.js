import React, { useState, useRef, useMemo, useEffect } from "react";
import JoditEditor from "jodit-react";
import { useSelector, useDispatch } from "react-redux";
import { updateField } from "../../lib/slices/courseSlice"; // Adjust path if needed

const TextEditor = ({ placeholder }) => {
  const dispatch = useDispatch();
  const editor = useRef(null);

  // Fetch `editorContent` from Redux (initial data from backend)
  const editorContent = useSelector((state) => state.course.editorContent);

  // Local state for editor
  const [content, setContent] = useState(editorContent || "");

  // Update content when backend data arrives
  useEffect(() => {
    if (editorContent !== content) {
      setContent(editorContent || "");
    }
  }, []);

  // Editor configuration
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
    }),
    [placeholder],
  );

  // Function to extract plain text from HTML
  const extractPlainText = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    return tempDiv.innerText.trim(); // Removes extra spaces and line breaks
  };

  // Handle content change
  const handleContentChange = (newContent) => {
    setContent(newContent);

    const plainText = extractPlainText(newContent);

    // Update Redux only if content has actually changed
    if (plainText !== editorContent) {
      dispatch(updateField({ field: "editorContent", value: plainText }));
    }
  };

  return (
    <JoditEditor
      ref={editor}
      value={content} // Set initial content
      config={config}
      tabIndex={1}
      onBlur={handleContentChange}
      onChange={handleContentChange} // Update in real time
    />
  );
};

export default TextEditor;
