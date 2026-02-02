import React from 'react';

const TabButton = React.memo(({ 
  tab, 
  isActive, 
  onClick, 
  onKeyDown,
  tabRef,
  index,
  totalTabs 
}) => {
  return (
    <button
      ref={tabRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`
        relative z-20 transition-all duration-100 ease-out flex-shrink-0
        focus:outline-none select-none cursor-default
        font-inter font-normal text-black whitespace-nowrap overflow-hidden text-ellipsis
        border border-[#BEBEBE]
        min-w-[90px] 
        ${isActive 
          ? 'h-[48.5px] mt-[1px] pb-0 bg-white rounded-t-lg border-b-0' 
          : 'h-[38px] mt-[6px] pb-1 bg-[#D9D9D9] rounded-lg'
        }
        ${index < totalTabs - 1 ? 'mr-2 sm:mr-3 lg:mr-4' : ''}
      `}
      style={{
        width: 'clamp(90px, 14vw, 175px)',
        paddingLeft: 'clamp(6px, 1.5vw, 16px)',
        paddingRight: 'clamp(6px, 1.5vw, 16px)',
        fontSize: 'clamp(11px, 1.6vw, 13px)',
        lineHeight: '15px',
        marginRight: index < totalTabs - 1 ? 'clamp(6px, 1.2vw, 12px)' : '0'
      }}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      id={`tab-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
    >
      {tab.label}
    </button>
  );
});

TabButton.displayName = 'TabButton';

export default TabButton;
