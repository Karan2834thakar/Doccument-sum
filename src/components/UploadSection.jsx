import { Upload as UploadIcon, Sparkles as SparkleIcon, File as FileIcon, X as XIcon } from 'lucide-react';

const UploadSection = ({ file, loading, handleFileChange, handleUpload, setFile }) => {
  return (
    <div className="flex flex-col h-full bg-[#0e1117] border border-white/8 rounded-2xl overflow-hidden">

      {/* Panel header */}
      <div className="px-6 py-4 border-b border-white/6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-px bg-[#00FF88]" />
          <span className="text-[#00FF88] text-xs font-semibold tracking-[0.2em] uppercase">
            AI Analysis Hub V2.0
          </span>
        </div>
        <p className="text-white/40 text-xs mt-1">Upload your document to begin analysis</p>
      </div>

      {/* Upload dropzone — takes most of the space */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 
       relative overflow-hidden">

        {!file ? (
          <label className="w-full flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl hover:border-[#00FF88]/40 transition-all cursor-pointer group bg-white/[0.02] hover:bg-white/[0.04] p-4 text-center">
            {/* Upload icon */}
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#00FF88]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#00FF88]/20 transition-all">
              <UploadIcon className="w-6 h-6 md:w-7 md:h-7 text-[#00FF88]" />
            </div>

            <p className="text-white font-semibold text-sm md:text-base mb-1">Drop your file here</p>
            <p className="text-white/30 text-[10px] md:text-xs mb-3 md:mb-4">or click to browse</p>

            {/* File type badges */}
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
              {['PDF', 'TXT', 'CSV', 'XLSX'].map(type => (
                <span key={type} className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-white/5 border border-white/8 text-white/50 text-[9px] md:text-xs font-mono">
                  {type}
                </span>
              ))}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".pdf,.txt,.csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center border border-white/10 rounded-xl bg-white/[0.02] relative p-4 md:p-8">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#00FF88]/10 flex items-center justify-center mb-3 md:mb-4 transition-all">
              <FileIcon className="w-6 h-6 md:w-7 md:h-7 text-[#00FF88]" />
            </div>

            <p className="text-white font-semibold text-sm md:text-base mb-1 truncate px-2 max-w-full">{file.name}</p>
            <p className="text-white/30 text-[10px] md:text-xs mb-4 md:mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

            {!loading && (
              <button
                onClick={(e) => { e.preventDefault(); setFile(null); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-[10px] md:text-xs font-medium"
              >
                <XIcon className="w-3 h-3 md:w-3.5 md:h-3.5" /> Remove
              </button>
            )}

            {loading && (
              <div className="absolute inset-0 bg-[#0e1117]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                <div className="w-8 h-8 border-2 border-white/10 border-t-[#00FF88] rounded-full animate-spin mb-3"></div>
                <p className="text-[#00FF88] text-xs font-semibold tracking-widest uppercase">Neural Ingestion...</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Start Analysis button — pinned to bottom */}
      <div className="p-5 border-t border-white/6">
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-3.5 rounded-xl bg-[#00FF88] text-black text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#00ffaa] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            <>
              <SparkleIcon className="w-4 h-4" />
              Start Analysis
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default UploadSection;
