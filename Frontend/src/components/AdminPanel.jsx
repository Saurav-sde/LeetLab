import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { Plus, X, Loader2, Terminal } from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).min(1, 'Please select at least one tag'),
  visibleTestCases: z.array(z.object({ input: z.string().min(1, 'Input required'), output: z.string().min(1, 'Output required'), explanation: z.string().min(1, 'Explanation required'), displayInput: z.string().min(1, 'Display Input required'), displayOutput: z.string().min(1, 'Display Output required'), })).min(1, 'At least one visible test case is required'),
  hiddenTestCases: z.array(z.object({ input: z.string().min(1, 'Input required'), output: z.string().min(1, 'Output required'), })).min(1, 'At least one hidden test case is required'),
  startCode: z.array(z.object({ language: z.enum(['C++', 'Java', 'JavaScript']), initialCode: z.string().min(1, 'Initial code required'), })).length(3, 'All three templates are required'),
  referenceSolution: z.array(z.object({ language: z.enum(['C++', 'Java', 'JavaScript']), completeCode: z.string().min(1, 'Complete code required'), })).length(3, 'All three solutions are required'),
});


const FormInput = ({ label, register, name, error, as: Component = 'input', className = '', ...props }) => (
  <div>
    <label className="font-mono text-sm text-neutral-400 mb-2 block">{label}</label>
    <Component
      {...register(name)}
      className={`w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md p-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-yellow-500 placeholder:text-neutral-600 ${className}`}
      {...props}
    />
    {error && <p className="text-red-400 mt-1.5 text-xs font-mono">{error.message}</p>}
  </div>
);

const TabButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`font-mono px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-500
        ${isActive
            ? 'text-yellow-400 border-yellow-400 bg-neutral-700/40'
            : 'text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-700/20'
        }`}
    >
        {label}
    </button>
);

const CodeEditorTabs = ({ register, errors }) => {
    const languages = ['C++', 'Java', 'JavaScript'];
    const [activeLang, setActiveLang] = useState(languages[0]);

    return (
        <div>
            <div className="border-b border-neutral-700 mb-4">
                {languages.map(lang => (
                    <TabButton key={lang} label={lang} isActive={activeLang === lang} onClick={() => setActiveLang(lang)} />
                ))}
            </div>
            <div>
                {languages.map((lang, index) => (
                    <div key={lang} className={activeLang === lang ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FormInput label="Starter Code" register={register} name={`startCode.${index}.initialCode`} error={errors.startCode?.[index]?.initialCode} as="textarea" className="font-mono text-xs h-72 resize-y" />
                            <FormInput label="Reference Solution" register={register} name={`referenceSolution.${index}.completeCode`} error={errors.referenceSolution?.[index]?.completeCode} as="textarea" className="font-mono text-xs h-72 resize-y" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


function AdminPanel() {
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState('visible');

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: { difficulty: 'easy', tags: [], visibleTestCases: [], hiddenTestCases: [], startCode: [ { language: 'C++', initialCode: '' }, { language: 'Java', initialCode: '' }, { language: 'JavaScript', initialCode: '' } ], referenceSolution: [ { language: 'C++', completeCode: '' }, { language: 'Java', completeCode: '' }, { language: 'JavaScript', completeCode: '' } ] }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  useEffect(() => {
    axiosClient.get('/tags/getAll')
      .then(res => setAvailableTags(res.data))
      .catch(err => {
        console.error("Failed to fetch tags:", err);
        setSubmitError('Failed to load tags. Please try refreshing the page.');
      });
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-neutral-200 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center gap-4">
            <Terminal className="w-10 h-10 text-yellow-400"/>
            <div>
                <h1 className="text-3xl font-bold text-neutral-100 font-mono">Create New Problem</h1>
                {/* <p className="text-neutral-500 font-mono text-sm">/admin/problems/new</p> */}
            </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h2 className="font-mono text-lg font-bold text-yellow-400 mb-4 border-b border-neutral-700 pb-3">1. Basic Information</h2>
                    <div className="space-y-6">
                        <FormInput label="Title" register={register} name="title" error={errors.title} placeholder="e.g., Two Sum" />
                        <FormInput label="Description (Markdown Supported)" register={register} name="description" error={errors.description} as="textarea" rows={6} placeholder="Provide a clear and concise problem description..." />
                    </div>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <div className="flex justify-between items-center border-b border-neutral-700 pb-3 mb-4">
                        <h2 className="font-mono text-lg font-bold text-yellow-400">2. Test Cases</h2>
                        <button type="button" onClick={() => activeTestCaseTab === 'visible' ? appendVisible({ input: '', output: '', explanation: '', displayInput: '', displayOutput: '' }) : appendHidden({ input: '', output: '' })} className="flex items-center gap-2 text-yellow-400 border border-yellow-600/50 hover:bg-yellow-500/10 text-xs font-semibold py-2 px-3 rounded-md transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <Plus size={16} /> Add Case
                        </button>
                    </div>
                    <div className="border-b border-neutral-700">
                        <TabButton label="Visible Cases" isActive={activeTestCaseTab === 'visible'} onClick={() => setActiveTestCaseTab('visible')} />
                        <TabButton label="Hidden Cases" isActive={activeTestCaseTab === 'hidden'} onClick={() => setActiveTestCaseTab('hidden')} />
                    </div>
                    <div className="pt-6 space-y-4">
                        {activeTestCaseTab === 'visible' && visibleFields.map((field, index) => (
                            <div key={field.id} className="bg-black/30 p-4 rounded-md border border-neutral-700 relative">
                                <button type="button" onClick={() => removeVisible(index)} className="absolute top-3 right-3 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"><X size={18} /></button>
                                <p className="font-mono text-sm text-neutral-400 mb-3">Visible Case #{index + 1}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Display Input" register={register} name={`visibleTestCases.${index}.displayInput`} error={errors.visibleTestCases?.[index]?.displayInput} as="textarea" rows={3} className="text-sm font-mono" />
                                    <FormInput label="Display Output" register={register} name={`visibleTestCases.${index}.displayOutput`} error={errors.visibleTestCases?.[index]?.displayOutput} as="textarea" rows={3} className="text-sm font-mono" />
                                    <FormInput label="Execution Input (stdin)" register={register} name={`visibleTestCases.${index}.input`} error={errors.visibleTestCases?.[index]?.input} as="textarea" rows={3} className="text-sm font-mono" />
                                    <FormInput label="Execution Output (stdout)" register={register} name={`visibleTestCases.${index}.output`} error={errors.visibleTestCases?.[index]?.output} as="textarea" rows={3} className="text-sm font-mono" />
                                    <div className="md:col-span-2">
                                        <FormInput label="Explanation" register={register} name={`visibleTestCases.${index}.explanation`} error={errors.visibleTestCases?.[index]?.explanation} as="textarea" rows={2} className="text-sm"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {activeTestCaseTab === 'hidden' && hiddenFields.map((field, index) => (
                            <div key={field.id} className="bg-black/30 p-4 rounded-md border border-neutral-700 relative">
                                <button type="button" onClick={() => removeHidden(index)} className="absolute top-3 right-3 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"><X size={18} /></button>
                                <p className="font-mono text-sm text-neutral-400 mb-3">Hidden Case #{index + 1}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Execution Input (stdin)" register={register} name={`hiddenTestCases.${index}.input`} error={errors.hiddenTestCases?.[index]?.input} as="textarea" rows={3} className="text-sm font-mono" />
                                    <FormInput label="Execution Output (stdout)" register={register} name={`hiddenTestCases.${index}.output`} error={errors.hiddenTestCases?.[index]?.output} as="textarea" rows={3} className="text-sm font-mono" />
                                </div>
                            </div>
                        ))}
                        {errors.visibleTestCases?.root && activeTestCaseTab === 'visible' && <p className="text-red-400 mt-2 text-sm font-mono">{errors.visibleTestCases.root.message}</p>}
                        {errors.hiddenTestCases?.root && activeTestCaseTab === 'hidden' && <p className="text-red-400 mt-2 text-sm font-mono">{errors.hiddenTestCases.root.message}</p>}
                    </div>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h2 className="font-mono text-lg font-bold text-yellow-400 mb-4 border-b border-neutral-700 pb-3">3. Code Templates & Solutions</h2>
                    <CodeEditorTabs register={register} errors={errors} />
                </div>
            </div>

            {/* Action Panel (Right & Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6 bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                <h2 className="font-mono text-lg font-bold text-yellow-400 mb-2 border-b border-neutral-700 pb-3">Actions & Metadata</h2>
                <div>
                  <label className="font-mono text-sm text-neutral-400 mb-2 block">Difficulty</label>
                  <select {...register('difficulty')} className="w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-md p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-yellow-500">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                 <div>
                  <label className="font-mono text-sm text-neutral-400 mb-2 block">Tags</label>
                  <div className="bg-neutral-900 border border-neutral-700 rounded-md p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                      {availableTags.map(tag => (
                        <label key={tag._id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-neutral-700/50 transition-colors">
                          <input type="checkbox" {...register('tags')} value={tag._id} className="w-4 h-4 bg-neutral-700 border-neutral-600 rounded text-yellow-500 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-yellow-500"/>
                          <span className="capitalize text-neutral-300 select-none text-sm">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.tags && <p className="text-red-400 mt-1.5 text-xs font-mono">{errors.tags.message}</p>}
                </div>
                <div className="pt-4 border-t border-neutral-700">
                    {submitError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-md mb-4 text-center text-sm font-mono">
                          {submitError}
                      </div>
                    )}
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed text-base cursor-pointer">
                        {isSubmitting ? (<><Loader2 className="animate-spin" size={20} /> Submitting...</>) : 'Create Problem'}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;