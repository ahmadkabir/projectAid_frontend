import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import {
  ArrowLeft,
  Save,
  X,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDocumentPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.get(id);
      if (response.data.document) {
        setContent(response.data.document.content);
        setHistory([response.data.document.content]);
        setHistoryIndex(0);
      } else {
        toast.error('Document not found. Please generate it first.');
        navigate(`/admin/projects/${id}/attachments`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Document not found. Please generate it first.');
        navigate(`/admin/projects/${id}/attachments`);
      } else {
        toast.error('Failed to load document');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML || e.target.textContent || '';
    setContent(newContent);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (newHistory.length > 50) {
      newHistory.shift();
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const ensureContent = () => {
    if (!content.trim()) {
      toast.error('Document content cannot be empty');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!ensureContent()) return;

    setSaving(true);
    try {
      await documentAPI.save(id, content);
      toast.success('Document saved successfully!', {
        duration: 4000,
        icon: '✅'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save document');
      console.error('Save document error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsFile = () => {
    if (!ensureContent()) return;
    setFormatModalOpen(true);
  };

  const confirmExport = async () => {
    setIsExporting(true);
    try {
      await documentAPI.saveFile(id, {
        content,
        format: selectedFormat
      });
      toast.success('Document exported successfully!');
      setFormatModalOpen(false);
      navigate(`/admin/projects/${id}/attachments`, { replace: true, state: { refresh: Date.now() } });
    } catch (error) {
      console.error('Export document error:', error);
      toast.error(error.response?.data?.message || 'Failed to export document');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/projects');
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/admin/projects/${id}/attachments`}
          className="inline-flex items-center space-x-2 text-admin-blue hover:text-admin-blue-hover transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Attachments</span>
        </Link>
        <p className="text-sm text-admin-muted mt-2">Edit and format your generated document</p>
      </div>

      <div className="card p-4 mb-4 border border-admin-border">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 border-r border-admin-border pr-2">
            <button onClick={() => handleFormat('bold')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Bold" type="button">
              <Bold size={18} />
            </button>
            <button onClick={() => handleFormat('italic')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Italic" type="button">
              <Italic size={18} />
            </button>
            <button onClick={() => handleFormat('underline')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Underline" type="button">
              <Underline size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-admin-border pr-2">
            <button onClick={() => handleFormat('justifyLeft')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Align Left" type="button">
              <AlignLeft size={18} />
            </button>
            <button onClick={() => handleFormat('justifyCenter')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Align Center" type="button">
              <AlignCenter size={18} />
            </button>
            <button onClick={() => handleFormat('justifyRight')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Align Right" type="button">
              <AlignRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-admin-border pr-2">
            <button onClick={() => handleFormat('insertUnorderedList')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Bullet List" type="button">
              <List size={18} />
            </button>
            <button onClick={() => handleFormat('insertOrderedList')} className="p-2 hover:bg-admin-bg rounded transition-colors" title="Numbered List" type="button">
              <ListOrdered size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-admin-bg rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
              type="button"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-admin-bg rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
              type="button"
            >
              ↷ Redo
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          className="min-h-[600px] p-6 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue focus:ring-offset-2 prose prose-lg max-w-none"
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.8',
            fontSize: '14px',
            color: '#374151'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={handleCancel}
            disabled={saving || isExporting}
            className="px-6 py-3 bg-admin-bg text-admin-text rounded-lg hover:bg-admin-bg transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isExporting}
            className="px-6 py-3 bg-admin-blue text-white rounded-lg hover:bg-admin-blue-hover transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Draft</span>
              </>
            )}
          </button>
          <button
            onClick={handleSaveAsFile}
            disabled={saving || isExporting}
            className="px-6 py-3 bg-admin-success text-white rounded-lg hover:bg-admin-success/90 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {formatModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-admin-blue">Select export format</h3>
              <button onClick={() => setFormatModalOpen(false)} className="text-admin-muted hover:text-admin-blue">
                <X size={20} />
              </button>
            </div>
            <p className="text-admin-muted">Choose the format you want to save this document as:</p>

            <div className="space-y-3">
              {['pdf', 'docx'].map((format) => (
                <label
                  key={format}
                  className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedFormat === format ? 'border-admin-blue bg-admin-blue/5' : 'border-admin-border'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-admin-muted">{format.toUpperCase()}</p>
                    <p className="text-sm text-admin-muted">
                      {format === 'pdf' ? 'Ideal for printing and read-only sharing' : 'Editable Microsoft Word document'}
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={selectedFormat === format}
                    onChange={() => setSelectedFormat(format)}
                    className="text-admin-blue focus:ring-admin-blue"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                onClick={() => setFormatModalOpen(false)}
                disabled={isExporting}
                className="px-4 py-2 rounded-lg border border-admin-border text-admin-muted hover:bg-admin-bg disabled:opacity-50"
              >
                Close
              </button>
              <button
                onClick={confirmExport}
                disabled={isExporting}
                className="px-4 py-2 rounded-lg bg-admin-blue text-white hover:bg-admin-blue-hover disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentPreview;
