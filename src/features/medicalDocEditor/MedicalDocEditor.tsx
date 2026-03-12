import { C } from "./utils/medicalDocEditor.utils";
import { useMedicalDocEditor } from "./hooks/useMedicalDocEditor";
import { Sidebar }        from "./Sidebar";
import { EditorToolbar }  from "./EditorToolbar";
import { DocumentPage }   from "./components/document/DocumentPage";
import { PrintPreview }   from "./PrintPreview";

export function MedicalDocEditor() {
  const e = useMedicalDocEditor();

  if (e.printMode) {
    return (
      <PrintPreview
        logos={e.logos} logoPositions={e.logoPositions} logoSizes={e.logoSizes} logoOpacities={e.logoOpacities}
        hasTopLogos={e.hasTopLogos} border={e.border} pw={e.pw} ph={e.ph} margins={e.margins}
        docFontSize={e.docFontSize} rtl={e.rtl}
        headerRef={e.headerRef} bodyRef={e.bodyRef} footerRef={e.footerRef}
        headerHtml={e.headerHtml} bodyHtml={e.bodyHtml} footerHtml={e.footerHtml}
        setPrintMode={e.setPrintMode}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato','Helvetica Neue',sans-serif", background: C.tealBg, overflow: "hidden" }}>

      <Sidebar
        activePanel={e.activePanel}       setActivePanel={e.setActivePanel}
        setPrintMode={e.setPrintMode}
        activeTemplate={e.activeTemplate} applyTemplate={e.applyTemplate}
        rtl={e.rtl}                       setRtl={e.setRtl}
        docFontSize={e.docFontSize}       setDocFontSize={e.setDocFontSize}
        logos={e.logos}                   logoPositions={e.logoPositions}
        logoSizes={e.logoSizes}           logoOpacities={e.logoOpacities}
        activeLogoId={e.activeLogoId}     fileInputRef={e.fileInputRef}
        onUploadClick={() => e.fileInputRef.current?.click()}
        onFileChange={e.handleLogoUpload}
        setActiveLogoId={e.setActiveLogoId} removeLogo={e.removeLogo}
        setLogoPositions={e.setLogoPositions}
        setLogoSizes={e.setLogoSizes}
        setLogoOpacities={e.setLogoOpacities}
        layoutTab={e.layoutTab}           setLayoutTab={e.setLayoutTab}
        pageSize={e.pageSize}             orientation={e.orientation}
        margins={e.margins}               customSize={e.customSize}
        pw={e.pw}                         ph={e.ph}
        border={e.border}
        onPageSize={e.updatePageSize}     onOrientation={e.setOrientation}
        onMargins={e.updateMargins}       onCustomSize={e.updateCustomSize}
        updateBorder={e.updateBorder}
        editTarget={e.editTarget}         setEditTarget={e.setEditTarget}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <EditorToolbar
          editTarget={e.editTarget}   rtl={e.rtl}
          border={e.border}           pageSize={e.pageSize}
          orientation={e.orientation} pw={e.pw}     ph={e.ph}
          margins={e.margins}         exec={e.exec} setRtl={e.setRtl}
        />
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px", background: C.tealBg, display: "flex", justifyContent: "center" }}>
          <DocumentPage
            logos={e.logos} logoPositions={e.logoPositions} logoSizes={e.logoSizes} logoOpacities={e.logoOpacities}
            hasTopLogos={e.hasTopLogos} border={e.border} pw={e.pw} ph={e.ph} margins={e.margins}
            docFontSize={e.docFontSize} rtl={e.rtl} editTarget={e.editTarget}
            headerRef={e.headerRef} bodyRef={e.bodyRef} footerRef={e.footerRef}
            setHeaderHtml={e.setHeaderHtml} setBodyHtml={e.setBodyHtml} setFooterHtml={e.setFooterHtml}
            activateSection={e.activateSection}
          />
        </div>
      </div>
    </div>
  );
}
