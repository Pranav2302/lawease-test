import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileIcon, Loader2, BarChart2, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSelector } from 'react-redux';

const PDFSummary = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingSuccess, setProcessingSuccess] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [summary, setSummary] = useState(null);
  
  // Get token from Redux store
  const { token } = useSelector((state) => state.auth);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadSuccess(false);
      setPdfUrl('');
      setProcessingSuccess(false);
      setProcessingResult(null);
      setSummary(null);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };
  
  const fetchSummary = async () => {
    setIsFetchingSummary(true);
    const summaryToastId = toast.loading('Generating document summary...');
    
    try {
      // Use the same endpoint but with GET method
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/case/upload-pdf-summary`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Store the summary as is, without assuming its format
        setSummary(response.data.summary);
        toast.success('Summary generated successfully!', { id: summaryToastId });
      } else {
        throw new Error(response.data?.message || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error(error.response?.data?.message || 'Failed to generate summary', { id: summaryToastId });
    } finally {
      setIsFetchingSummary(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }
    
    setIsLoading(true);
    setSummary(null);
    const toastId = toast.loading('Uploading and processing PDF...');
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('pdfFile', file);
      
      // Upload and process in a single request
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/case/upload-pdf-summary`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Set the PDF URL from response
        setPdfUrl(response.data.pdfUrl);
        setUploadSuccess(true);
        
        // Check if processing was successful
        if (response.data.processingSuccess) {
          setProcessingSuccess(true);
          setProcessingResult(response.data.processingResult);
          toast.success('Document uploaded and processed successfully', { id: toastId });
        } else {
          setProcessingSuccess(false);
          toast.success('Document uploaded, ready for analysis', { id: toastId });
        }
      } else {
        toast.error('Failed to upload document', { id: toastId });
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error.response?.data?.message || 'Upload and processing failed', 
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Legal Document Summarization</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-md ">
        {/* Results Panel - Larger */}
        <Card className="md:col-span-8 order-2 md:order-1">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-black text-white rounded-md">
            <CardTitle className="text-2xl flex items-center">
              <BarChart2 className="mr-2 h-6 w-6" />
              Document Analysis Results
            </CardTitle>
            <CardDescription className="text-gray-300">
              View the extracted information and summary of your legal document
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-white border rounded-lg shadow-sm">
              {!uploadSuccess ? (
                <div className="text-center text-gray-400 h-80 flex items-center justify-center p-4 ">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-16 w-16 animate-spin mb-4 text-black" />
                      <p className="text-lg font-medium text-black">Processing your document...</p>
                      <p className="text-gray-500 mt-2">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FileText className="h-20 w-20 text-gray-300 mb-4" />
                      <p className="text-xl font-medium text-gray-500">No Document Analyzed Yet</p>
                      <p className="text-gray-400 mt-2">Upload a document to see analysis results</p>
                    </div>
                  )}
                </div>
             ) : summary ? (
              <div className="p-5">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Document Summary</h2>
                <div className="bg-gray-50 p-4 rounded-md border text-gray-800 h-72 overflow-auto">
                  {typeof summary === 'string' ? (
                    // If summary is a string, display it with line breaks
                    summary.split('\n').map((paragraph, index) => (
                      paragraph ? <p key={index} className="mb-3">{paragraph}</p> : <br key={index} />
                    ))
                  ) : (
                    // If summary is an object or other type, stringify it
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(summary, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : processingSuccess ? (
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Document Preview</h2>
                  <div className="bg-gray-50 rounded-md border h-72 flex flex-col overflow-hidden">
                    {pdfUrl ? (
                      <iframe 
                        src={pdfUrl}
                        className="w-full h-full rounded-md"
                        title="PDF Document"
                        frameBorder="0"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">PDF preview not available</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center h-80 flex flex-col items-center justify-center p-4">
                  <FileText className="h-16 w-16 text-black mb-3" />
                  <h3 className="text-xl font-medium mb-2">Document Uploaded Successfully</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Your document is ready for analysis. Click the button below to generate a summary.
                  </p>
                  <Button 
                    onClick={fetchSummary}
                    disabled={isFetchingSummary}
                    className="bg-black hover:bg-black/80"
                    size="lg"
                  >
                    {isFetchingSummary ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Summary...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Document Summary
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {uploadSuccess && (
              <div className="flex flex-wrap gap-3 mt-5 justify-center">
                {pdfUrl && (
                  <Button
                    onClick={() => window.open(pdfUrl, '_blank')}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Original Document
                  </Button>
                )}
                
                {uploadSuccess && !summary && !isFetchingSummary && (
                  <Button
                    onClick={fetchSummary}
                    className="bg-black hover:bg-black/80 flex items-center"
                    disabled={isFetchingSummary}
                  >
                    {isFetchingSummary ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                )}
                
                {summary && (
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={() => {
                      // Create a download link for the summary
                      const blob = new Blob([summary], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'document_summary.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Summary
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upload Panel - Smaller */}
        <Card className="md:col-span-4 order-1 md:order-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileIcon className="mr-2 h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Select a PDF document to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center bg-gray-50">
                  <FileIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop PDF or click to select
                  </p>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("pdf-upload")?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
                {file && (
                  <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-black" />
                      <p className="font-medium text-gray-700 truncate">{file.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-6">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analyze Document
                  </span>
                )}
              </Button>
            </form>
            
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              <p className="mb-1">• Accepts PDF documents up to 10MB</p>
              <p className="mb-1">• Legal documents only for best results</p>
              <p>• Analysis typically takes 30-60 seconds</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDFSummary;