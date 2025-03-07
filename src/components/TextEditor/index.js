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
  const [content, setContent] = useState("");

  // Update content when backend data arrives
  useEffect(() => {
    if (editorContent) {
      setContent(editorContent);
    }
  }, [editorContent]);

  // Editor configuration
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
    }),
    [placeholder],
  );

  // Handle content change
  const handleContentChange = (newContent) => {
    setContent(newContent);

    // Extract plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newContent;
    const plainText = tempDiv.innerText;

    // Dispatch update to Redux
    dispatch(updateField({ field: "editorContent", value: plainText }));
  };

  return (
    <JoditEditor
      ref={editor}
      value={content} // Set initial content
      config={config}
      tabIndex={1}
      onBlur={handleContentChange}
      onChange={() => {}} // Avoid unwanted updates
    />
  );
};

export default TextEditor;
