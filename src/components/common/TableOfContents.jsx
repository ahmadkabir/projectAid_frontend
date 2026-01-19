import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

const TableOfContents = ({ collapsible = true, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div 
        className={`flex items-center justify-between mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-2">
          <FileText className="text-primary-blue" size={24} />
          <h3 className="text-xl font-bold text-primary-blue">Table of Contents</h3>
        </div>
        {collapsible && (
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-6 text-gray-700">
          {/* Chapter One */}
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">CHAPTER ONE: INTRODUCTION</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="text-sm">1.1 Background of the Study</li>
              <li className="text-sm">1.2 Statement of the Problem</li>
              <li className="text-sm">1.3 Aim and Objectives of the Study</li>
              <li className="text-sm">1.4 Research Questions</li>
              <li className="text-sm">1.5 Research Hypotheses <span className="text-gray-500 italic">(if applicable)</span></li>
              <li className="text-sm">1.6 Significance of the Study</li>
              <li className="text-sm">1.7 Scope and Delimitation of the Study</li>
              <li className="text-sm">1.8 Limitations of the Study</li>
              <li className="text-sm">1.9 Definition of Terms</li>
            </ul>
          </div>

          {/* Chapter Two */}
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">CHAPTER TWO: REVIEW OF RELATED LITERATURE</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="text-sm">2.1 Introduction</li>
              <li className="text-sm">2.2 Conceptual Framework</li>
              <li className="text-sm ml-4">2.2.1 Concept of the Study Variables</li>
              <li className="text-sm ml-4">2.2.2 Overview of the Subject Area</li>
              <li className="text-sm">2.3 Theoretical Framework</li>
              <li className="text-sm ml-4">2.3.1 Relevant Theory/Theories</li>
              <li className="text-sm">2.4 Empirical Review</li>
              <li className="text-sm">2.5 Summary of Literature Review</li>
            </ul>
          </div>

          {/* Chapter Three */}
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">CHAPTER THREE: RESEARCH METHODOLOGY</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="text-sm">3.1 Introduction</li>
              <li className="text-sm">3.2 Research Design</li>
              <li className="text-sm">3.3 Area of the Study</li>
              <li className="text-sm">3.4 Population of the Study</li>
              <li className="text-sm">3.5 Sample Size and Sampling Technique</li>
              <li className="text-sm">3.6 Research Instruments</li>
              <li className="text-sm">3.7 Validity of the Instrument</li>
              <li className="text-sm">3.8 Reliability of the Instrument</li>
              <li className="text-sm">3.9 Method of Data Collection</li>
              <li className="text-sm">3.10 Method of Data Analysis</li>
              <li className="text-sm">3.11 Ethical Considerations</li>
            </ul>
          </div>

          {/* Chapter Four */}
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">CHAPTER FOUR: DATA PRESENTATION, ANALYSIS AND DISCUSSION</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="text-sm">4.1 Introduction</li>
              <li className="text-sm">4.2 Data Presentation</li>
              <li className="text-sm">4.3 Analysis of Research Questions</li>
              <li className="text-sm">4.4 Test of Hypotheses <span className="text-gray-500 italic">(if applicable)</span></li>
              <li className="text-sm">4.5 Discussion of Findings</li>
            </ul>
          </div>

          {/* Chapter Five */}
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS</h4>
            <ul className="space-y-1.5 ml-4">
              <li className="text-sm">5.1 Summary of Findings</li>
              <li className="text-sm">5.2 Conclusion</li>
              <li className="text-sm">5.3 Recommendations</li>
              <li className="text-sm">5.4 Suggestions for Further Studies</li>
            </ul>
          </div>

          {/* References and Appendices */}
          <div className="pt-4 border-t border-gray-200">
            <ul className="space-y-1.5 ml-4">
              <li className="text-sm font-semibold text-gray-900">References</li>
              <li className="text-sm font-semibold text-gray-900">Appendices</li>
              <li className="text-sm ml-4">Appendix A: Questionnaire / Interview Guide</li>
              <li className="text-sm ml-4">Appendix B: Additional Data</li>
            </ul>
          </div>

          {/* Note */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic">
              This is a standard academic project structure following Nigerian Polytechnic & University standards. 
              The actual documentation may vary based on project requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;
