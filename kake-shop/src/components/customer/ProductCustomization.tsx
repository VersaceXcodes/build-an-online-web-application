import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductModifierGroup, ProductModifierOption, CartItemCustomization } from '../../types/database';
import './ProductCustomization.css';

interface ModifierGroupWithOptions extends ProductModifierGroup {
  options: ProductModifierOption[];
}

interface Props {
  productId: string;
  onCustomizationChange: (customizations: CartItemCustomization[], totalAdjustment: number) => void;
}

export const ProductCustomization: React.FC<Props> = ({ productId, onCustomizationChange }) => {
  const [groups, setGroups] = useState<ModifierGroupWithOptions[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModifierGroups();
  }, [productId]);

  useEffect(() => {
    calculateCustomizations();
  }, [selectedOptions, groups]);

  const loadModifierGroups = async () => {
    try {
      setLoading(true);
      
      // Load modifier groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('product_modifier_groups')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (groupsError) throw groupsError;

      // Load options for each group
      const groupsWithOptions = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { data: optionsData, error: optionsError } = await supabase
            .from('product_modifier_options')
            .select('*')
            .eq('modifier_group_id', group.id)
            .eq('available', true)
            .order('display_order');

          if (optionsError) throw optionsError;

          return {
            ...group,
            options: optionsData || []
          };
        })
      );

      setGroups(groupsWithOptions);
    } catch (error) {
      console.error('Error loading modifier groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCustomizations = () => {
    const customizations: CartItemCustomization[] = [];
    let totalAdjustment = 0;

    groups.forEach(group => {
      const selectedInGroup = selectedOptions.get(group.id);
      if (selectedInGroup) {
        selectedInGroup.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            customizations.push({
              group_id: group.id,
              group_name: group.name,
              option_id: option.id,
              option_name: option.name,
              price_adjustment: option.price_adjustment
            });
            totalAdjustment += option.price_adjustment;
          }
        });
      }
    });

    onCustomizationChange(customizations, totalAdjustment);
  };

  const handleOptionSelect = (group: ModifierGroupWithOptions, optionId: string) => {
    setSelectedOptions(prev => {
      const newMap = new Map(prev);
      const groupSelections = newMap.get(group.id) || new Set<string>();

      if (group.selection_type === 'single') {
        // Radio behavior - only one selection
        if (groupSelections.has(optionId)) {
          groupSelections.clear();
        } else {
          groupSelections.clear();
          groupSelections.add(optionId);
        }
      } else {
        // Checkbox behavior - multiple selections
        if (groupSelections.has(optionId)) {
          groupSelections.delete(optionId);
        } else {
          // Check max selections
          if (group.max_selections && groupSelections.size >= group.max_selections) {
            return prev; // Don't add if max reached
          }
          groupSelections.add(optionId);
        }
      }

      if (groupSelections.size === 0) {
        newMap.delete(group.id);
      } else {
        newMap.set(group.id, groupSelections);
      }

      return newMap;
    });
  };

  const isOptionSelected = (groupId: string, optionId: string): boolean => {
    const groupSelections = selectedOptions.get(groupId);
    return groupSelections ? groupSelections.has(optionId) : false;
  };

  const canSelectMore = (group: ModifierGroupWithOptions): boolean => {
    if (group.selection_type === 'single') return true;
    if (!group.max_selections) return true;
    
    const groupSelections = selectedOptions.get(group.id);
    const currentCount = groupSelections ? groupSelections.size : 0;
    return currentCount < group.max_selections;
  };

  if (loading) {
    return <div className="customization-loading">Loading options...</div>;
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="product-customization">
      {groups.map(group => (
        <div key={group.id} className="customization-group">
          <h3 className="customization-group-title">
            {group.name}
            {group.selection_type === 'multi' && group.max_selections && (
              <span className="selection-limit">
                (Select up to {group.max_selections})
              </span>
            )}
          </h3>

          <div className="customization-options">
            {group.options.map(option => {
              const isSelected = isOptionSelected(group.id, option.id);
              const canSelect = canSelectMore(group) || isSelected;

              return (
                <button
                  key={option.id}
                  className={`customization-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                  onClick={() => canSelect && handleOptionSelect(group, option.id)}
                  disabled={!canSelect}
                  aria-pressed={isSelected}
                >
                  <div className="option-content">
                    <span className="option-name">{option.name}</span>
                    {option.price_adjustment > 0 && (
                      <span className="option-price">+€{option.price_adjustment.toFixed(2)}</span>
                    )}
                    {option.price_adjustment < 0 && (
                      <span className="option-price discount">€{option.price_adjustment.toFixed(2)}</span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="option-checkmark">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
