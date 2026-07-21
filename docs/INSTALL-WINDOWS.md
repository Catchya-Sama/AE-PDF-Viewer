# PDF Viewer v1.0.1 — Windows Installation

## Requirements

- Windows 10 or Windows 11
- Adobe After Effects 2020 or newer
- Extension type: CEP 9 (`.zxp`), not UXP

## Option A — Install the ZXP package

1. Close After Effects.
2. Open a CEP-compatible ZXP installer, such as ZXP/UXP Installer or Anastasiy's Extension Manager.
3. Select `PDF-Viewer-v1.0.1.zxp` and complete the installation.
4. Restart After Effects.
5. Open `Window > Extensions > PDF Viewer`.

The package is signed with a self-signed certificate issued to `notcatchya`.
Some installers display an untrusted-publisher warning for self-signed certificates;
confirm the publisher name and continue only when the package came from the expected source.

## Option B — Install the ZIP manually

1. Close After Effects.
2. Extract `PDF-Viewer-v1.0.1-Windows.zip`.
3. Copy the extracted `com.catchya.pdfviewer` folder to:

   ```text
   %APPDATA%\Adobe\CEP\extensions\
   ```

   The final manifest path must be:

   ```text
   %APPDATA%\Adobe\CEP\extensions\com.catchya.pdfviewer\CSXS\manifest.xml
   ```

4. If unsigned CEP extensions are disabled, run this command once in Command Prompt:

   ```bat
   reg add "HKCU\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f
   ```

5. Restart After Effects and open `Window > Extensions > PDF Viewer`.

## Verify downloads

Compare the SHA-256 values of the downloaded files with `SHA256SUMS.txt`:

```powershell
Get-FileHash .\PDF-Viewer-v1.0.1-Windows.zip -Algorithm SHA256
Get-FileHash .\PDF-Viewer-v1.0.1.zxp -Algorithm SHA256
```

## Known limitations

- This release is a CEP extension and does not support the UXP/CCX package format.
- After Effects 2020 may cache normal clipboard paste state outside active text-edit mode. Use `To AE` or `Paste as Text Layer` for deterministic transfer into After Effects.
- Search and text selection depend on the PDF containing an extractable text layer; scanned image-only PDFs require OCR outside this extension.

## Uninstall

Close After Effects, then remove:

```text
%APPDATA%\Adobe\CEP\extensions\com.catchya.pdfviewer
```