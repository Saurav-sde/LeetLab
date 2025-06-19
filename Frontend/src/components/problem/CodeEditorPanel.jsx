// src/components/problem/CodeEditorPanel.js

import Editor from '@monaco-editor/react';
// MODIFIED: Import the minimize icon as well
import { FiMaximize, FiMinimize2 } from 'react-icons/fi'; 
import { FaAngleDown } from 'react-icons/fa';

const getLanguageForMonaco = (lang) => {
    return lang === 'javascript' || lang === 'java' || lang === 'cpp' ? lang : 'javascript';
};

// MODIFIED: Accept onMaximize and isMaximized props
const CodeEditorPanel = ({ 
    selectedLanguage, 
    onLanguageChange, 
    code, 
    onCodeChange, 
    onEditorMount, 
    languageMap, 
    onMaximize, 
    isMaximized 
}) => {
    
    const handleLanguageSelect = (language) => {
        onLanguageChange(language);
        if (document.activeElement) {
          document.activeElement.blur(); // Close the dropdown
        }
    };

    return (
        // The overall structure is perfect. No changes needed here.
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center px-3 py-2 border-b border-gray-700 min-h-13">
                <div className="dropdown">
                    <label tabIndex={0} className=" text-md normal-case text-gray-400 hover:text-white flex justify-center items-center cursor-pointer">
                        <strong>{languageMap[selectedLanguage]}</strong>
                        <FaAngleDown/>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 mt-1 shadow-lg bg-[#2D2D2D] text-gray-300 rounded-md w-40 z-[1]">
                        <li><a onClick={() => handleLanguageSelect('cpp')} className="hover:bg-neutral-700 hover:text-white rounded-md">C++</a></li>
                        <li><a onClick={() => handleLanguageSelect('java')} className="hover:bg-neutral-700 hover:text-white rounded-md">Java</a></li>
                        <li><a onClick={() => handleLanguageSelect('javascript')} className="hover:bg-neutral-700 hover:text-white rounded-md">JavaScript</a></li>
                    </ul>
                </div>

                {/* MODIFIED: The static icon is now a dynamic button */}
                <div className="flex items-center gap-3 text-gray-400 text-lg">
                    <button
                        onClick={onMaximize}
                        className="cursor-pointer hover:text-white"
                        title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                        {isMaximized ? <FiMinimize2 /> : <FiMaximize />}
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-[#1e1e1e]">
                <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={value => onCodeChange(value || '')}
                    onMount={onEditorMount}
                    theme="vs-dark"
                    options={{ fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true, }}
                />
            </div>
        </div>
    );
};

export default CodeEditorPanel;