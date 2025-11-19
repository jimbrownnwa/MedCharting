import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Image, X } from 'lucide-react'

interface UploadedFile {
  file: File
  preview: string
  description: string
}

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [description, setDescription] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: ''
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    }
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleUpload = () => {
    const filesWithDescription = files.map((f) => ({
      ...f,
      description: description
    }))
    onUpload(filesWithDescription)
    setFiles([])
    setDescription('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">File Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isDragActive ? 'Drop files here...' : 'Drag & Drop to upload'}
          </p>
        </div>

        {/* Choose File Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          <Image className="h-4 w-4 mr-2" />
          Choose File
        </Button>

        {/* Preview uploaded files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Files</Label>
            <div className="grid grid-cols-2 gap-2">
              {files.map((f, index) => (
                <div key={index} className="relative group">
                  {f.file.type.startsWith('image/') ? (
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">{f.file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Description */}
        <div className="space-y-2">
          <Label htmlFor="file-description">File Description</Label>
          <Textarea
            id="file-description"
            placeholder="Enter a description for the uploaded files..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {files.length > 0 && (
          <Button className="w-full" onClick={handleUpload}>
            Upload {files.length} file{files.length > 1 ? 's' : ''}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
