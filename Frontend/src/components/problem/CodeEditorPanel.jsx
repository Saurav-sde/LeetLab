// src/components/problem/CodeEditorPanel.js
import Editor from '@monaco-editor/react';
import { FiSettings, FiMaximize } from 'react-icons/fi';
import { FaAngleDown } from 'react-icons/fa';

const getLanguageForMonaco = (lang) => {
    return lang === 'javascript' || lang === 'java' || lang === 'cpp' ? lang : 'javascript';
};

const CodeEditorPanel = ({ selectedLanguage, onLanguageChange, code, onCodeChange, onEditorMount, languageMap }) => {
    
    const handleLanguageSelect = (language) => {
        onLanguageChange(language);
        if (document.activeElement) {
          document.activeElement.blur(); // Close the dropdown
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center px-3 py-2 bg-[#282828] border-b border-gray-700 min-h-13">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-sm btn-outline btn-warning text-md normal-case hover:btn-active hover:text-white">
                        <strong>{languageMap[selectedLanguage]}</strong>
                        <FaAngleDown/>
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 mt-1 shadow-lg bg-[#2D2D2D] text-gray-300 rounded-md w-40 z-[1]">
                        <li><a onClick={() => handleLanguageSelect('cpp')} className="hover:bg-neutral-700 hover:text-white rounded-md">C++</a></li>
                        <li><a onClick={() => handleLanguageSelect('java')} className="hover:bg-neutral-700 hover:text-white rounded-md">Java</a></li>
                        <li><a onClick={() => handleLanguageSelect('javascript')} className="hover:bg-neutral-700 hover:text-white rounded-md">JavaScript</a></li>
                    </ul>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-lg">
                    <FiSettings className="cursor-pointer hover:text-white"/>
                    <FiMaximize className="cursor-pointer hover:text-white"/>
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
                    options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, insertSpaces: true, wordWrap: 'on' }}
                />
            </div>
        </div>
    );
};

export default CodeEditorPanel;