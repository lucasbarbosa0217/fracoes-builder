import { useCallback } from 'react'
import html2canvas from 'html2canvas'

export function useCapture() {
    const copyImage = useCallback(async (ref) => {
        if (!ref.current) return
        
        try {
            const canvas = await html2canvas(ref.current, { backgroundColor: null })
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob')
                    return
                }
                navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]).then(() => {
                    console.log('Image copied to clipboard')
                }).catch(err => console.error('Failed to copy:', err))
            })
        } catch (err) {
            console.error('Failed to capture:', err)
        }
    }, [])

    const downloadImage = useCallback(async (ref) => {
        if (!ref.current) return

        try {
            const canvas = await html2canvas(ref.current, { backgroundColor: null })
            const link = document.createElement('a')
            link.href = canvas.toDataURL('image/png')
            link.download = `fracao-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Failed to download:', err)
        }
    }, [])

    return { copyImage, downloadImage }
}