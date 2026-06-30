import { FILE_FOLDERS } from '../data/mockData';
import AmongUsIcon from './AmongUsIcon';
import '../styles/FileExplorer.css';

export default function FileExplorer({ crewmate, onFolderOpen, onBack }) {
  return (
    <div className="fe-container">
      {/* Breadcrumb */}
      <div className="fe-breadcrumb">
        <span className="fe-breadcrumb-icon">
          <AmongUsIcon color={crewmate.color} />
        </span>
        <span className="fe-breadcrumb-sep">&gt;</span>
        <span>{crewmate.name}</span>
        <span className="fe-breadcrumb-sep">&gt;</span>
      </div>

      {/* Column headers */}
      <div className="fe-header">
        <span className="fe-header-cell">
          <span className="fe-header-check" />
          Name
        </span>
        <span className="fe-header-cell">Date modified</span>
        <span className="fe-header-cell">Type</span>
        <span className="fe-header-cell">Size</span>
      </div>

      {/* File rows */}
      <div className="fe-list">
        {FILE_FOLDERS.map(folder => (
          <div
            key={folder.key}
            className={`fe-row ${folder.openable ? '' : 'is-disabled'}`}
            onClick={() => folder.openable && onFolderOpen(folder)}
            role="button"
            tabIndex={folder.openable ? 0 : -1}
            onKeyDown={(e) => {
              if (folder.openable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onFolderOpen(folder);
              }
            }}
          >
            <span className="fe-row-name">{folder.name}</span>
            <span className="fe-row-date">{folder.dateModified}</span>
            <span className="fe-row-type">{folder.type}</span>
            <span className="fe-row-size">{folder.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
