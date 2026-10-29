import React, { useState } from 'react';
import type { RoomItem, ItemCondition } from '../../types';
import { Badge } from '../common/Badge';
import { Plus, Clock, Maximize2, Image as ImageIcon, ShieldCheck, Camera, Sliders } from 'lucide-react';
import { AddRoomItemModal } from './AddRoomItemModal';
import { AssessRoomItemModal } from './AssessRoomItemModal';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { useAuth } from '../../context/AuthContext';
import { getPhotoUrl, getPhotoHash, getPhotoName } from '../../utils/photo.util';

interface RoomChecklistProps {
  items: RoomItem[];
  baselineItems?: RoomItem[];
  isLocked: boolean;
  inspectionType: 'move_in' | 'move_out';
  isRentalActive?: boolean;
  rentalStatus?: string;
  onAddItem: (item: {
    roomName: string;
    itemName: string;
    condition: ItemCondition;
    notes?: string;
    photos?: string[];
  }) => Promise<void>;
  onUpdateItem?: (itemId: string, item: {
    condition: ItemCondition;
    notes?: string;
    photos?: string[];
  }) => Promise<void>;
  onStartMoveOut?: () => Promise<void>;
}

export const RoomChecklist: React.FC<RoomChecklistProps> = ({
  items,
  baselineItems = [],
  isLocked,
  inspectionType,
  isRentalActive = true,
  rentalStatus,
  onAddItem,
  onUpdateItem,
  onStartMoveOut,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assessingItem, setAssessingItem] = useState<RoomItem | null>(null);
  const [activePhoto, setActivePhoto] = useState<{
    url: string;
    hash?: string;
    name?: string;
    title?: string;
    condition?: any;
    notes?: string;
  } | null>(null);

  const { role } = useAuth();

  const isLandlord = role === 'landlord';
  const isTenant = role === 'tenant';
  const isMoveOut = inspectionType === 'move_out';

  const isActive = isRentalActive && (rentalStatus ? (rentalStatus === 'active' || rentalStatus === 'completed') : true);

  // Adding new items is only allowed during Move-In baseline when rental is active and not locked
  const canAddItem = !isLocked && isLandlord && !isMoveOut && isActive;
  const canAssess = !isLocked && isLandlord && isMoveOut;

  const groupedItems = items.reduce<Record<string, RoomItem[]>>((acc, item) => {
    const room = item.roomName || 'General';
    if (!acc[room]) acc[room] = [];
    acc[room].push(item);
    return acc;
  }, {});

  const roomNames = Object.keys(groupedItems);

  // Helper to find corresponding move-in baseline item
  const findBaselineItem = (room: string, item: string): RoomItem | undefined => {
    return baselineItems.find(
      (b) =>
        b.roomName.trim().toLowerCase() === room.trim().toLowerCase() &&
        b.itemName.trim().toLowerCase() === item.trim().toLowerCase()
    );
  };

  const assessingBaselineItem = assessingItem
    ? findBaselineItem(assessingItem.roomName, assessingItem.itemName)
    : null;

  return (
    <div>
      {/* Waiting for Tenant Acceptance Banner */}
      {!isActive && isLandlord && !isMoveOut && (
        <div style={{
          padding: '0.85rem 1rem',
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.84rem',
          color: '#92400e',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <Clock size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Waiting for Tenant Acceptance:</strong> The tenant must accept the rental agreement invitation before checklist items can be added.
          </span>
        </div>
      )}

      {/* Sealed banner */}
      {isLocked && (
        <div style={{
          padding: '0.65rem 0.85rem',
          background: 'var(--color-verified-bg)',
          border: '1px solid var(--color-verified-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem',
          color: 'var(--color-verified)',
          marginBottom: '1rem',
          fontWeight: 500,
        }}>
          ✓ Inspection is sealed. Items cannot be added or edited.
        </div>
      )}

      {/* Tenant info banner */}
      {!isLocked && isTenant && (
        <div style={{
          padding: '0.65rem 0.85rem',
          background: '#f9fafb',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
        }}>
          Tenant view: Review items below and sign off on the right.
        </div>
      )}

      {/* Move-Out Landlord Walkthrough Banner */}
      {!isLocked && isLandlord && isMoveOut && items.length > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: '#f0f9ff',
          border: '1.5px solid #bae6fd',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.84rem',
          color: '#0369a1',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <Camera size={16} color="#0284c7" style={{ flexShrink: 0 }} />
          <span>
            <strong>Move-Out Walkthrough:</strong> Compare the actual room & fixture with the move-in baseline photos below. Click <strong>"Assess Condition"</strong> to record any damage, wear, or checkout photos.
          </span>
        </div>
      )}

      {/* Checklist Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          {isMoveOut ? 'Checkout Condition Assessment' : 'Room Items'} ({items.length})
        </h2>

        {canAddItem && items.length > 0 && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Empty State vs Grouped Items */}
      {roomNames.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            {isMoveOut
              ? isLandlord
                ? 'Checkout inspection not initialized. Start checkout to load items from the baseline.'
                : 'Awaiting landlord to initialize checkout inspection.'
              : !isActive
              ? 'Checklist recording is paused until the invited tenant accepts the rental agreement.'
              : isTenant
              ? 'No items recorded yet by landlord.'
              : 'No checklist items recorded yet.'}
          </p>

          {!isMoveOut && canAddItem && (
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add First Item</span>
            </button>
          )}

          {isMoveOut && !isLocked && isLandlord && onStartMoveOut && (
            <button onClick={onStartMoveOut} className="btn btn-primary btn-sm">
              <span>Start Checkout Inspection</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {roomNames.map((room) => (
            <div key={room} className="card" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '0.85rem',
              }}>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>{room}</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  {groupedItems[room].length} item{groupedItems[room].length === 1 ? '' : 's'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {groupedItems[room].map((item) => {
                  const baseline = isMoveOut ? findBaselineItem(room, item.itemName) : undefined;
                  const baselinePhotos = baseline?.photos || [];
                  const checkoutPhotos = item.photos || [];

                  return (
                    <div
                      key={item._id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        padding: '1rem 1.15rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      {/* Item Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f172a' }}>
                            {item.itemName}
                          </span>
                          {!isMoveOut && <Badge variant={item.condition} />}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {isMoveOut && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Checkout:</span>
                              <Badge variant={item.condition} />
                            </div>
                          )}

                          {canAssess && (
                            <button
                              type="button"
                              onClick={() => setAssessingItem(item)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.76rem', padding: '0.28rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Sliders size={13} />
                              <span>Assess Condition</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* MOVE-OUT VIEW: Side-by-Side Baseline vs Checkout Evidence */}
                      {isMoveOut ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                          {/* Baseline Reference Column */}
                          <div style={{
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            padding: '0.75rem 0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase' }}>
                                <ShieldCheck size={13} color="#10b981" />
                                <span>Move-In Baseline Reference</span>
                              </span>
                              {baseline && <Badge variant={baseline.condition} />}
                            </div>

                            {/* Move-In Baseline Photos */}
                            {baselinePhotos.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {baselinePhotos.map((photo: any, pIdx: number) => {
                                  const photoUrl = getPhotoUrl(photo);
                                  const hash = getPhotoHash(photo);
                                  const fileName = getPhotoName(photo);

                                  return (
                                    <div
                                      key={pIdx}
                                      onClick={() => {
                                        if (photoUrl) {
                                          setActivePhoto({
                                            url: photoUrl,
                                            hash,
                                            name: fileName,
                                            title: `Move-In Baseline: ${room} • ${item.itemName}`,
                                            condition: baseline?.condition,
                                            notes: baseline?.notes,
                                          });
                                        }
                                      }}
                                      className="photo-thumbnail-card"
                                      style={{
                                        position: 'relative',
                                        borderRadius: '6px',
                                        border: '1.5px solid #86efac',
                                        background: '#ffffff',
                                        padding: '3px',
                                        cursor: 'pointer',
                                      }}
                                      title="Click to view move-in reference photo full-size"
                                    >
                                      <div style={{ width: '72px', height: '72px', borderRadius: '4px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
                                        <img
                                          src={photoUrl}
                                          alt="Baseline"
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="thumbnail-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', opacity: 0 }}>
                                          <Maximize2 size={15} />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                No move-in photos attached at baseline
                              </div>
                            )}

                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 'auto' }}>
                              <strong>Baseline Notes:</strong> {baseline?.notes || 'No baseline notes recorded'}
                            </div>
                          </div>

                          {/* Checkout State Column */}
                          <div style={{
                            background: item.condition === 'damaged' || item.condition === 'not_working'
                              ? '#fef2f2'
                              : item.condition === 'minor_scratch'
                              ? '#fffbeb'
                              : '#f8fafc',
                            borderRadius: '8px',
                            border: item.condition === 'damaged' || item.condition === 'not_working'
                              ? '1.5px solid #fecaca'
                              : item.condition === 'minor_scratch'
                              ? '1.5px solid #fde68a'
                              : '1px solid #e2e8f0',
                            padding: '0.75rem 0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase' }}>
                                <Camera size={13} color="#0284c7" />
                                <span>Move-Out Checkout State</span>
                              </span>
                              <Badge variant={item.condition} />
                            </div>

                            {/* Move-Out Checkout Photos */}
                            {checkoutPhotos.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {checkoutPhotos.map((photo: any, pIdx: number) => {
                                  const photoUrl = getPhotoUrl(photo);
                                  const hash = getPhotoHash(photo);
                                  const fileName = getPhotoName(photo);

                                  return (
                                    <div
                                      key={pIdx}
                                      onClick={() => {
                                        if (photoUrl) {
                                          setActivePhoto({
                                            url: photoUrl,
                                            hash,
                                            name: fileName,
                                            title: `Move-Out Checkout: ${room} • ${item.itemName}`,
                                            condition: item.condition,
                                            notes: item.notes,
                                          });
                                        }
                                      }}
                                      className="photo-thumbnail-card"
                                      style={{
                                        position: 'relative',
                                        borderRadius: '6px',
                                        border: '1.5px solid #bae6fd',
                                        background: '#ffffff',
                                        padding: '3px',
                                        cursor: 'pointer',
                                      }}
                                      title="Click to view move-out checkout photo full-size"
                                    >
                                      <div style={{ width: '72px', height: '72px', borderRadius: '4px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
                                        <img
                                          src={photoUrl}
                                          alt="Checkout"
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="thumbnail-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', opacity: 0 }}>
                                          <Maximize2 size={15} />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                {isLandlord && !isLocked
                                  ? 'No checkout photos attached. Click "Assess Condition" to record.'
                                  : 'No checkout photos attached.'}
                              </div>
                            )}

                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 'auto' }}>
                              <strong>Checkout Notes:</strong> {item.notes || 'No checkout notes recorded'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* MOVE-IN VIEW: Notes and verified photo evidence */
                        <>
                          {item.notes && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              {item.notes}
                            </p>
                          )}

                          {item.photos && item.photos.length > 0 && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                              <div style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '0.45rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}>
                                <ImageIcon size={13} color="#0284c7" />
                                <span>Photo Evidence ({item.photos.length}) — Click to inspect</span>
                              </div>

                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                                {item.photos.map((photo: any, pIdx: number) => {
                                  const photoUrl = getPhotoUrl(photo);
                                  const hash = getPhotoHash(photo);
                                  const fileName = getPhotoName(photo);

                                  return (
                                    <div
                                      key={pIdx}
                                      onClick={() => {
                                        if (photoUrl) {
                                          setActivePhoto({
                                            url: photoUrl,
                                            hash,
                                            name: fileName,
                                            title: `${item.roomName} • ${item.itemName}`,
                                            condition: item.condition,
                                            notes: item.notes,
                                          });
                                        }
                                      }}
                                      style={{
                                        position: 'relative',
                                        borderRadius: '8px',
                                        border: '1.5px solid #cbd5e1',
                                        background: '#ffffff',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                      }}
                                      className="photo-thumbnail-card"
                                      title="Click to view full image and cryptographic SHA-256 evidence"
                                    >
                                      <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        background: '#0f172a',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                        {photoUrl ? (
                                          <img
                                            src={photoUrl}
                                            alt={item.itemName}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              display: 'block',
                                            }}
                                          />
                                        ) : (
                                          <div style={{ color: '#94a3b8' }}>
                                            <ImageIcon size={22} />
                                          </div>
                                        )}

                                        <div
                                          style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(15, 23, 42, 0.45)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            opacity: 0,
                                          }}
                                          className="thumbnail-overlay"
                                        >
                                          <Maximize2 size={18} />
                                        </div>

                                        {hash && (
                                          <div
                                            style={{
                                              position: 'absolute',
                                              bottom: '4px',
                                              right: '4px',
                                              background: 'rgba(15, 23, 42, 0.85)',
                                              backdropFilter: 'blur(4px)',
                                              borderRadius: '4px',
                                              padding: '2px 5px',
                                              fontSize: '0.62rem',
                                              fontWeight: 700,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '3px',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                              zIndex: 2,
                                            }}
                                            title={`Tamper-Proof SHA-256 Verified:\n${hash}`}
                                          >
                                            <ShieldCheck size={10} color="#34d399" />
                                            <span style={{ color: '#f8fafc' }}>Verified</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Room Item (Move-In) */}
      {canAddItem && (
        <AddRoomItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={onAddItem}
        />
      )}

      {/* Modal: Assess Room Item Condition (Move-Out) */}
      {assessingItem && onUpdateItem && (
        <AssessRoomItemModal
          isOpen={!!assessingItem}
          onClose={() => setAssessingItem(null)}
          item={assessingItem}
          baselineItem={assessingBaselineItem}
          onSave={onUpdateItem}
        />
      )}

      {/* Photo Lightbox Evidence Modal */}
      {activePhoto && (
        <PhotoViewerModal
          isOpen={!!activePhoto}
          onClose={() => setActivePhoto(null)}
          photoUrl={activePhoto.url}
          sha256Hash={activePhoto.hash}
          fileName={activePhoto.name}
          title={activePhoto.title}
          condition={activePhoto.condition}
          notes={activePhoto.notes}
        />
      )}
    </div>
  );
};
