import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { projectsAPI, ordersAPI, downloadProjectFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Download,
  ShoppingCart,
  FileText,
  Eye
} from 'lucide-react';

// Documents are stored as plain text/markdown (`**HEADING**`, `---`, paragraphs).
// Render them like a printed page rather than raw text.
const renderDocument = (text) => {
  const blocks = [];
  const lines = String(text || '').split('\n');
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'p', key: `p-${blocks.length}`, text: paragraph.join(' ') });
    paragraph = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      return;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'rule', key: `r-${index}` });
      return;
    }

    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({ type: 'h', key: `h-${index}`, text: headingMatch[1] });
      return;
    }

    paragraph.push(trimmed.replace(/\*\*(.+?)\*\*/g, '$1'));
  });

  flushParagraph();
  return blocks;
};

const DocumentPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const wantFullView = isAdmin && searchParams.get('full') === '1';

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await projectsAPI.getDocumentPreview(id, {
          full: wantFullView ? 1 : 0
        });
        if (!cancelled) setPreview(response.data);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || 'Failed to load document preview');
          navigate(`/projects/${id}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, user, wantFullView]);

  // Render the same preview as a real PDF (watermark + page numbers).
  useEffect(() => {
    if (!preview?.available) {
      setPdfUrl(null);
      setPdfLoading(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    setPdfLoading(true);
    setPdfUrl(null);

    projectsAPI
      .documentPreviewPdf(id, { full: wantFullView ? 1 : 0 })
      .then((response) => {
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(
          new Blob([response.data], { type: 'application/pdf' })
        );
        setPdfUrl(objectUrl);
      })
      .catch(() => {
        // Fall back to the HTML sample already loaded.
        if (!cancelled) setPdfUrl(null);
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [id, preview?.available, preview?.unlocked, wantFullView]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to purchase the full document');
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      const response = await ordersAPI.create({
        items: [{ projectId: parseInt(id), itemType: 'documentation' }]
      });
      const orderId = response.data.order.id;

      const payment = await ordersAPI.initializePayment(orderId);
      if (!payment.data.authorizationUrl) {
        throw new Error('Paystack did not return a checkout URL');
      }

      sessionStorage.setItem(
        'paymentReturnTo',
        `${window.location.pathname}${window.location.search}`
      );
      window.location.assign(payment.data.authorizationUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <Loading />;
  if (!preview) return null;

  const { project, available, unlocked, sample, content, lockedSections = [], totalLength } = preview;
  const readableText = unlocked ? content : sample;
  const blocks = renderDocument(readableText);
  const samplePercent =
    totalLength && sample ? Math.max(1, Math.round((sample.length / totalLength) * 100)) : 0;
  const estimatedPages = totalLength ? Math.max(1, Math.ceil(totalLength / 3000)) : 0;
  const price = parseFloat(project?.documentationPrice || 0);

  const previewFiles = preview.documentFiles || [];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-green transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Project</span>
          </button>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  if (wantFullView) next.delete('full');
                  else next.set('full', '1');
                  setSearchParams(next, { replace: true });
                }}
                className="inline-flex items-center space-x-1.5 border border-gray-300 hover:border-primary-blue text-gray-700 hover:text-primary-blue px-3 py-1 rounded-full text-sm font-medium transition-colors"
                title={wantFullView ? 'Show what customers see' : 'Show the full document (admin only)'}
              >
                {wantFullView ? <Eye size={16} /> : <Unlock size={16} />}
                <span>{wantFullView ? 'Preview as customer' : 'View full document'}</span>
              </button>
            )}
            {unlocked ? (
              <span className="inline-flex items-center space-x-1.5 bg-primary-green/10 text-primary-green px-3 py-1 rounded-full text-sm font-semibold">
                <Unlock size={16} />
                <span>Full document unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                <Eye size={16} />
                <span>Free sample</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Document heading */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-blue mb-1">
            {project?.title}
          </h1>
          <p className="text-gray-600">
            {[project?.level, project?.institution, project?.category?.name]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        {!available ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-primary-blue mb-2">
              No written preview available yet
            </h2>
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">
              {preview.teaser ||
                'This project does not have a readable preview yet. You can still buy the full documentation and download the PDF.'}
            </p>
            {/* No written text to preview: buyers download the file, others see the offer */}
            {unlocked ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {previewFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => downloadProjectFile(file)}
                    className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    <Download size={18} />
                    <span>{file.fileType?.toUpperCase() || 'FILE'}</span>
                  </button>
                ))}
                <Link
                  to={`/projects/${id}`}
                  className="inline-flex items-center space-x-2 border-2 border-gray-200 hover:border-primary-blue text-gray-700 hover:text-primary-blue font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Project</span>
                </Link>
              </div>
            ) : user ? (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                <span>
                  {purchasing ? 'Processing...' : `Purchase Documentation — ₦${price.toFixed(2)}`}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                <ShoppingCart size={18} />
                <span>Login to purchase</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={`${pdfUrl ? 'max-w-4xl' : 'max-w-3xl'} mx-auto`}>
            {/* The "page" */}
            <article className="relative bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-sm border border-gray-100 px-7 py-10 md:px-16 md:py-16 font-serif text-gray-800 leading-7 text-[15px]">
              {!unlocked && !pdfUrl && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
                  >
                    <span className="rotate-[-24deg] text-gray-900/[0.05] text-8xl font-bold tracking-widest">
                      SAMPLE
                    </span>
                  </div>
                  <div className="absolute top-5 right-5 text-[11px] font-sans font-semibold tracking-widest text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    FREE SAMPLE
                  </div>
                </>
              )}

              <div className="relative">
                {pdfLoading ? (
                  <div className="flex h-[520px] items-center justify-center font-sans text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-blue border-t-transparent" />
                    <span className="ml-3">Preparing PDF preview…</span>
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title={`${project?.title || 'Project'} preview PDF`}
                    className="h-[72vh] min-h-[540px] w-full rounded border border-gray-200 bg-gray-50"
                  />
                ) : (
                  blocks.map((block) => {
                    if (block.type === 'rule') {
                      return <hr key={block.key} className="my-6 border-gray-200" />;
                    }
                    if (block.type === 'h') {
                      return (
                        <h2
                          key={block.key}
                          className="text-center font-bold uppercase tracking-wide text-[15px] my-5"
                        >
                          {block.text}
                        </h2>
                      );
                    }
                    return (
                      <p key={block.key} className="mb-4 text-justify">
                        {block.text}
                      </p>
                    );
                  })
                )}
              </div>

              {/* Locked continuation */}
              {!unlocked && (
                <>
                  <div className="relative -mt-2 h-24 overflow-hidden" aria-hidden="true">
                    <div className="absolute inset-x-0 bottom-0 space-y-3 opacity-50 select-none blur-[2.5px]">
                      {[92, 84, 96, 71, 88].map((width, index) => (
                        <div
                          key={index}
                          className="h-3 bg-gray-300 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/85 to-white" />
                  </div>

                  <div className="mt-4 text-center border-2 border-dashed border-primary-blue/30 rounded-xl p-6 md:p-8 bg-primary-blue/5 font-sans">
                    <Lock className="mx-auto text-primary-blue mb-3" size={36} />
                    <h2 className="text-xl font-bold text-primary-blue mb-2">
                      The rest of this document is locked
                    </h2>
                    <p className="text-gray-600 mb-5 max-w-xl mx-auto">
                      You've read {samplePercent}% of this document. Purchase the full
                      documentation to unlock{' '}
                      {lockedSections.length > 0
                        ? `all ${lockedSections.length} sections`
                        : 'every section'}{' '}
                      {estimatedPages > 0 && `(~${estimatedPages} pages)`} and download the PDF.
                    </p>

                    {lockedSections.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
                        {lockedSections.map((section, index) => (
                          <span
                            key={`${section}-${index}`}
                            className="inline-flex items-center space-x-1 bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs font-medium"
                          >
                            <Lock size={12} />
                            <span>{section}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {user ? (
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing || price <= 0}
                        className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white font-bold py-3.5 px-8 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={20} />
                        <span>
                          {purchasing
                            ? 'Processing payment...'
                            : price > 0
                            ? `Purchase Full Document — ₦${price.toFixed(2)}`
                            : 'Purchase Full Document'}
                        </span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="inline-flex items-center space-x-2 bg-primary-green hover:bg-primary-green/90 text-white font-bold py-3.5 px-8 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart size={20} />
                        <span>Login to Purchase</span>
                      </Link>
                    )}

                    <p className="mt-4 text-sm text-gray-500">
                      <Link
                        to={`/projects/${id}`}
                        className="text-primary-blue hover:underline font-medium"
                      >
                        Back to project details
                      </Link>
                    </p>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="mt-10 pt-4 border-t border-gray-200 flex items-center justify-between font-sans text-xs text-gray-400">
                <span>{project?.title}</span>
                <span>
                  {unlocked
                    ? `Full document · ~${estimatedPages} pages`
                    : pdfUrl
                      ? 'Watermarked sample PDF · page numbers'
                      : `Sample page 1 of ~${estimatedPages}`}
                </span>
              </div>
            </article>

            {/* Unlocked actions */}
            {unlocked && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {previewFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => downloadProjectFile(file)}
                    className="inline-flex items-center space-x-2 bg-primary-blue hover:bg-primary-blue-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    <Download size={18} />
                    <span>{file.fileType?.toUpperCase() || 'FILE'}</span>
                  </button>
                ))}
                <Link
                  to={`/projects/${id}`}
                  className="inline-flex items-center space-x-2 border-2 border-gray-200 hover:border-primary-blue text-gray-700 hover:text-primary-blue font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Project</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
